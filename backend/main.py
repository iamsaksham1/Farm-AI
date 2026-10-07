import os
import io
import time
import json
import base64
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from PIL import Image

from db import init_db, get_db, ScanRecord
from schemas import (
    PredictResponse,
    PredictionCandidate,
    AdvisoryDetails,
    HistoryItem,
    StatsResponse,
    SampleItem
)
from model import get_classifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("agrivision.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Initializing AgriVision AI Model pipeline...")
    get_classifier()
    logger.info("AgriVision AI Model pipeline is ready.")
    yield

app = FastAPI(
    title="AgriVision API",
    description="AI-Powered Crop Disease Diagnostic & Climate-Resilient Advisory API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "sample_images")
os.makedirs(SAMPLES_DIR, exist_ok=True)
app.mount("/samples", StaticFiles(directory=SAMPLES_DIR), name="samples")

@app.get("/api/health")
def health_check():
    classifier = get_classifier()
    return {
        "status": "online",
        "service": "AgriVision AI",
        "model_loaded": classifier.model is not None,
        "classes_count": len(classifier.advisory_data),
        "device": str(classifier.device),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/predict", response_model=PredictResponse)
async def predict_crop_disease(
    file: UploadFile = File(...),
    gradcam: bool = True,
    db: Session = Depends(get_db)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format: '{file.content_type}'. Please upload a valid image (JPEG, PNG, WEBP)."
        )

    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > 5.0:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size_mb:.2f}MB) exceeds the 5MB limit. Please upload a smaller photo."
        )

    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        logger.error(f"Corrupted image uploaded: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or unreadable image file. Please try taking another photo."
        )

    start_time = time.time()
    
    try:
        classifier = get_classifier()
        prediction = classifier.predict(image, generate_gradcam=gradcam)
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing image through AI classifier. Please try again."
        )
    
    inference_time = round((time.time() - start_time) * 1000.0, 2)

    try:
        thumb = image.copy()
        thumb.thumbnail((160, 160))
        buf = io.BytesIO()
        thumb.convert("RGB").save(buf, format="JPEG", quality=75)
        thumb_b64 = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    except Exception:
        thumb_b64 = None

    record_id = None
    try:
        record = ScanRecord(
            crop=prediction["crop"],
            crop_hi=prediction["crop_hi"],
            disease_name=prediction["disease_name"],
            disease_name_hi=prediction["disease_name_hi"],
            class_name=prediction["class_name"],
            confidence=prediction["confidence"],
            severity=prediction["severity"],
            is_healthy=prediction["is_healthy"],
            top3_json=json.dumps(prediction["top_3"]),
            image_thumbnail=thumb_b64
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
    except Exception as e:
        logger.error(f"Failed to record scan in database: {e}")
        db.rollback()

    return PredictResponse(
        success=True,
        class_name=prediction["class_name"],
        crop=prediction["crop"],
        crop_hi=prediction["crop_hi"],
        disease_name=prediction["disease_name"],
        disease_name_hi=prediction["disease_name_hi"],
        confidence=prediction["confidence"],
        severity=prediction["severity"],
        severity_hi=prediction["severity_hi"],
        is_healthy=prediction["is_healthy"],
        is_low_confidence=prediction["is_low_confidence"],
        top_3=[PredictionCandidate(**c) for c in prediction["top_3"]],
        advisory=AdvisoryDetails(**prediction["advisory"]),
        gradcam_image=prediction["gradcam_image"],
        inference_time_ms=inference_time,
        record_id=record_id
    )

@app.get("/api/history", response_model=List[HistoryItem])
def get_scan_history(limit: int = 50, db: Session = Depends(get_db)):
    records = db.query(ScanRecord).order_by(desc(ScanRecord.created_at)).limit(limit).all()
    history = []
    for r in records:
        history.append(HistoryItem(
            id=r.id,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            image_data=r.image_thumbnail,
            crop=r.crop,
            crop_hi=r.crop_hi,
            disease_name=r.disease_name,
            disease_name_hi=r.disease_name_hi,
            confidence=r.confidence,
            severity=r.severity,
            is_healthy=r.is_healthy
        ))
    return history

@app.delete("/api/history/{record_id}")
def delete_history_item(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record {record_id} deleted successfully"}

@app.get("/api/stats", response_model=StatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(ScanRecord.id)).scalar() or 0
    healthy = db.query(func.count(ScanRecord.id)).filter(ScanRecord.is_healthy == True).scalar() or 0
    diseased = total - healthy
    critical = db.query(func.count(ScanRecord.id)).filter(ScanRecord.severity.in_(["Critical", "High"])).scalar() or 0

    top_disease_rows = (
        db.query(ScanRecord.disease_name, ScanRecord.crop, func.count(ScanRecord.id).label("cnt"))
        .filter(ScanRecord.is_healthy == False)
        .group_by(ScanRecord.disease_name, ScanRecord.crop)
        .order_by(desc("cnt"))
        .limit(5)
        .all()
    )
    top_diseases = [
        {"disease": row[0], "crop": row[1], "count": row[2], "percentage": round((row[2] / (diseased or 1)) * 100, 1)}
        for row in top_disease_rows
    ]

    crop_rows = (
        db.query(ScanRecord.crop, func.count(ScanRecord.id).label("cnt"))
        .group_by(ScanRecord.crop)
        .order_by(desc("cnt"))
        .all()
    )
    crop_breakdown = [{"crop": row[0], "scans": row[1]} for row in crop_rows]

    today = datetime.now(timezone.utc).date()
    days_map = { (today - timedelta(days=i)).strftime("%b %d"): 0 for i in range(6, -1, -1) }
    
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_records = db.query(ScanRecord.created_at).filter(
        ScanRecord.created_at >= seven_days_ago
    ).all()
    for rec in recent_records:
        if rec.created_at:
            day_str = rec.created_at.strftime("%b %d")
            if day_str in days_map:
                days_map[day_str] += 1
            
    recent_activity = [{"date": k, "scans": v} for k, v in days_map.items()]

    return StatsResponse(
        total_scans=total,
        healthy_scans=healthy,
        diseased_scans=diseased,
        critical_alerts=critical,
        top_diseases=top_diseases,
        crop_breakdown=crop_breakdown,
        recent_activity=recent_activity
    )

@app.get("/api/samples", response_model=List[SampleItem])
def get_sample_leaf_images():
    samples = [
        SampleItem(
            id="sample_tomato_early_blight",
            crop="Tomato",
            disease_name="Early Blight",
            disease_name_hi="टमाटर का अगेती झुलसा",
            expected_class="Tomato___Early_blight",
            filename="tomato_early_blight.jpg",
            image_url="/samples/tomato_early_blight.jpg",
            description="Tomato leaf with dark target-board concentric necrotic spots and yellow halo.",
            description_hi="टमाटर की पत्ती पर पीले घेरे वाले गहरे भूरे चक्राकार झुलसा धब्बे।"
        ),
        SampleItem(
            id="sample_apple_black_rot",
            crop="Apple",
            disease_name="Black Rot",
            disease_name_hi="सेब का ब्लैक रॉट (सड़न)",
            expected_class="Apple___Black_rot",
            filename="apple_black_rot.jpg",
            image_url="/samples/apple_black_rot.jpg",
            description="Apple leaf exhibiting distinct frogeye spots with purple margin and dark core.",
            description_hi="सेब की पत्ती पर बैंगनी किनारों वाले मेंढक आंख जैसे गोल सड़न धब्बे।"
        ),
        SampleItem(
            id="sample_corn_common_rust",
            crop="Corn (Maize)",
            disease_name="Common Rust",
            disease_name_hi="मक्का का सामान्य रतुआ",
            expected_class="Corn_(maize)___Common_rust_",
            filename="corn_common_rust.jpg",
            image_url="/samples/corn_common_rust.jpg",
            description="Corn blade covered with dense reddish-brown cinnamon fungal rust pustules.",
            description_hi="मक्का की पत्ती पर दालचीनी जैसे गहरे लाल-भूरे उभरे हुए रतुआ फफोले।"
        ),
        SampleItem(
            id="sample_healthy_leaf",
            crop="Potato",
            disease_name="Healthy Leaf",
            disease_name_hi="स्वस्थ आलू पत्ती",
            expected_class="Potato___healthy",
            filename="healthy_leaf.jpg",
            image_url="/samples/healthy_leaf.jpg",
            description="Vibrant deep green pristine foliage showing optimal chlorophyll vitality.",
            description_hi="चमकदार गहरी हरी स्वस्थ पत्ती, बिना किसी रोग या पोषण की कमी के।"
        ),
    ]
    return samples

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
