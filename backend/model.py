import os
import io
import json
import base64
import logging
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
from transformers import MobileNetV2ForImageClassification

logger = logging.getLogger("agrivision.model")
logger.setLevel(logging.INFO)

# 38 Canonical PlantVillage Classes corresponding to the model output indices
PLANT_VILLAGE_CLASSES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

def apply_colormap_jet(heatmap: np.ndarray) -> np.ndarray:
    """
    Applies a JET colormap to a [0, 1] normalized 2D numpy array without OpenCV.
    Returns uint8 RGB array of shape (H, W, 3).
    """
    x = np.clip(heatmap, 0.0, 1.0)
    r = np.clip(1.5 - np.abs(4.0 * x - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * x - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * x - 1.0), 0.0, 1.0)
    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255.0).astype(np.uint8)

class PlantDiseaseClassifier:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(PlantDiseaseClassifier, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self, model_name: str = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"):
        if self.initialized:
            return
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.advisory_data = {}
        self.target_layer = None
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self._load_advisory()
        self._load_model()
        self.initialized = True

    def _load_advisory(self):
        advisory_path = os.path.join(os.path.dirname(__file__), "advisory.json")
        if os.path.exists(advisory_path):
            with open(advisory_path, "r", encoding="utf-8") as f:
                self.advisory_data = json.load(f)
            logger.info(f"Loaded {len(self.advisory_data)} advisory records from {advisory_path}")
        else:
            logger.warning(f"Advisory file not found at {advisory_path}")

    def _load_model(self):
        try:
            logger.info(f"Loading Plant Disease MobileNetV2 model: {self.model_name}")
            self.model = MobileNetV2ForImageClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            self.target_layer = self.model.mobilenet_v2.layer[-1]
            logger.info("Plant Disease ML Model loaded successfully on %s", self.device)
        except Exception as e:
            logger.error(f"Error loading model from HF ({e}), initializing fallback architecture...", exc_info=True)
            from torchvision.models import mobilenet_v2
            self.model = mobilenet_v2(num_classes=38)
            self.model.to(self.device)
            self.model.eval()
            self.target_layer = self.model.features[-1]

    def predict(self, image: Image.Image, generate_gradcam: bool = True) -> Dict[str, Any]:
        """
        Runs image inference, returns top-3 classes, confidence, full advisory, and optional Grad-CAM.
        """
        # Ensure RGB format
        if image.mode != "RGB":
            image = image.convert("RGB")

        orig_w, orig_h = image.size
        # Resize if oversized for safety
        if max(orig_w, orig_h) > 1024:
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

        # Prepare tensor with grad tracking for Grad-CAM
        tensor_img = self.transform(image).unsqueeze(0).to(self.device)
        tensor_img.requires_grad_(True)

        activations = []
        gradients = []

        def forward_hook(module, inp, out):
            activations.append(out)

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        f_handle = self.target_layer.register_forward_hook(forward_hook)
        b_handle = self.target_layer.register_full_backward_hook(backward_hook)

        try:
            logits = self.model(tensor_img).logits if hasattr(self.model(tensor_img), "logits") else self.model(tensor_img)
            probs = torch.softmax(logits, dim=-1)[0]
            topk_vals, topk_indices = torch.topk(probs, 3)

            top1_idx = topk_indices[0].item()
            top1_score = logits[0, top1_idx]

            # Compute Grad-CAM for top-1 prediction
            gradcam_b64 = None
            if generate_gradcam:
                self.model.zero_grad()
                top1_score.backward(retain_graph=True)

                if activations and gradients:
                    act = activations[0].detach()
                    grad = gradients[0].detach()
                    weights = torch.mean(grad, dim=[2, 3], keepdim=True)
                    cam = torch.sum(weights * act, dim=1, keepdim=True)
                    cam = F.relu(cam)
                    cam = cam - cam.min()
                    if cam.max() > 0:
                        cam = cam / cam.max()
                    
                    cam_np = F.interpolate(cam, size=(image.size[1], image.size[0]), mode="bilinear", align_corners=False)[0, 0].cpu().numpy()
                    
                    # Colormap and blending
                    heatmap_rgb = apply_colormap_jet(cam_np)
                    orig_np = np.array(image)
                    
                    # 50-50 alpha blend
                    blended = (0.55 * orig_np + 0.45 * heatmap_rgb).astype(np.uint8)
                    blended_img = Image.fromarray(blended)
                    
                    buf = io.BytesIO()
                    blended_img.save(buf, format="JPEG", quality=90)
                    gradcam_b64 = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
        finally:
            f_handle.remove()
            b_handle.remove()

        # Build top-3 candidates
        top_3 = []
        for prob, idx in zip(topk_vals, topk_indices):
            cls_idx = idx.item()
            cls_name = PLANT_VILLAGE_CLASSES[cls_idx] if cls_idx < len(PLANT_VILLAGE_CLASSES) else "Unknown"
            adv = self.advisory_data.get(cls_name, {})
            top_3.append({
                "class_name": cls_name,
                "crop": adv.get("crop", "Unknown"),
                "crop_hi": adv.get("crop_hi", "अज्ञात"),
                "disease_name": adv.get("disease_name", cls_name),
                "disease_name_hi": adv.get("disease_name_hi", cls_name),
                "confidence": round(prob.item() * 100.0, 2),
                "severity": adv.get("severity", "Medium")
            })

        top1_class = top_3[0]["class_name"]
        top1_confidence = top_3[0]["confidence"]
        top1_advisory = self.advisory_data.get(top1_class, {})

        is_healthy = "healthy" in top1_class.lower()
        is_low_confidence = top1_confidence < 60.0

        return {
            "class_name": top1_class,
            "crop": top1_advisory.get("crop", top_3[0]["crop"]),
            "crop_hi": top1_advisory.get("crop_hi", top_3[0]["crop_hi"]),
            "disease_name": top1_advisory.get("disease_name", top_3[0]["disease_name"]),
            "disease_name_hi": top1_advisory.get("disease_name_hi", top_3[0]["disease_name_hi"]),
            "confidence": top1_confidence,
            "severity": top1_advisory.get("severity", "Medium"),
            "severity_hi": top1_advisory.get("severity_hi", "मध्यम"),
            "is_healthy": is_healthy,
            "is_low_confidence": is_low_confidence,
            "top_3": top_3,
            "advisory": top1_advisory,
            "gradcam_image": gradcam_b64
        }

# Global singleton helper
_classifier_instance = None

def get_classifier() -> PlantDiseaseClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = PlantDiseaseClassifier()
    return _classifier_instance
