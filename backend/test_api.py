import os
import io
import json
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from main import app
from db import init_db

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "AgriVision AI"
    assert data["model_loaded"] is True
    assert data["classes_count"] == 38

def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 3
    for s in samples:
        assert "crop" in s
        assert "disease_name" in s
        assert "image_url" in s
        assert "expected_class" in s

def test_predict_endpoint_with_valid_image():
    # Create test image
    img = Image.new("RGB", (224, 224), color=(50, 150, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("test_leaf.jpg", buf, "image/jpeg")},
        data={"gradcam": "true"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "class_name" in data
    assert "crop" in data
    assert "disease_name" in data
    assert "confidence" in data
    assert "advisory" in data
    assert "top_3" in data
    assert len(data["top_3"]) == 3
    assert data["advisory"]["organic_treatment"] is not None
    assert data["advisory"]["chemical_treatment"] is not None
    assert data["advisory"]["cost_estimate_inr"] is not None
    assert data["gradcam_image"] is not None
    assert data["gradcam_image"].startswith("data:image/jpeg;base64,")

def test_predict_validation_rejects_non_image():
    fake_txt = io.BytesIO(b"Hello world this is not an image")
    response = client.post(
        "/api/predict",
        files={"file": ("document.txt", fake_txt, "text/plain")}
    )
    assert response.status_code == 400

def test_history_and_deletion():
    # 1. Fetch history
    response = client.get("/api/history")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    
    if len(history) > 0:
        first_id = history[0]["id"]
        # Delete first record
        del_resp = client.delete(f"/api/history/{first_id}")
        assert del_resp.status_code == 200
        assert del_resp.json()["success"] is True

def test_stats_endpoint():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "healthy_scans" in data
    assert "diseased_scans" in data
    assert "critical_alerts" in data
    assert "top_diseases" in data
    assert "crop_breakdown" in data
    assert "recent_activity" in data

def test_advisory_database_completeness():
    advisory_path = os.path.join(os.path.dirname(__file__), "advisory.json")
    assert os.path.exists(advisory_path)
    with open(advisory_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert len(data) == 38, f"Expected 38 classes, found {len(data)}"
    required_keys = [
        "crop", "crop_hi", "disease_name", "disease_name_hi",
        "severity", "severity_hi", "symptoms", "symptoms_hi",
        "cause", "cause_hi", "organic_treatment", "organic_treatment_hi",
        "chemical_treatment", "chemical_treatment_hi",
        "cost_estimate_inr", "cost_estimate_inr_hi",
        "prevention", "prevention_hi"
    ]
    for class_name, entry in data.items():
        for k in required_keys:
            assert k in entry, f"Missing key '{k}' in class '{class_name}'"
            assert len(str(entry[k]).strip()) > 0, f"Empty field '{k}' in class '{class_name}'"
