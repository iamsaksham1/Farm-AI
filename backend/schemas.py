from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictionCandidate(BaseModel):
    class_name: str
    crop: str
    crop_hi: str
    disease_name: str
    disease_name_hi: str
    confidence: float
    severity: str

class AdvisoryDetails(BaseModel):
    crop: str
    crop_hi: str
    disease_name: str
    disease_name_hi: str
    severity: str
    severity_hi: str
    symptoms: str
    symptoms_hi: str
    cause: str
    cause_hi: str
    organic_treatment: str
    organic_treatment_hi: str
    chemical_treatment: str
    chemical_treatment_hi: str
    cost_estimate_inr: str
    cost_estimate_inr_hi: str
    prevention: str
    prevention_hi: str

class PredictResponse(BaseModel):
    success: bool
    class_name: str
    crop: str
    crop_hi: str
    disease_name: str
    disease_name_hi: str
    confidence: float
    severity: str
    severity_hi: str
    is_healthy: bool
    is_low_confidence: bool
    top_3: List[PredictionCandidate]
    advisory: AdvisoryDetails
    gradcam_image: Optional[str] = None
    inference_time_ms: float
    record_id: Optional[int] = None

class HistoryItem(BaseModel):
    id: int
    created_at: str
    image_data: Optional[str] = None
    crop: str
    crop_hi: Optional[str] = None
    disease_name: str
    disease_name_hi: Optional[str] = None
    confidence: float
    severity: str
    is_healthy: bool

class StatsResponse(BaseModel):
    total_scans: int
    healthy_scans: int
    diseased_scans: int
    critical_alerts: int
    top_diseases: List[Dict[str, Any]]
    crop_breakdown: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

class SampleItem(BaseModel):
    id: str
    crop: str
    disease_name: str
    disease_name_hi: str
    expected_class: str
    filename: str
    image_url: str
    description: str
    description_hi: str
