# 🌱 AgriVision — Smart & Climate-Resilient AI Crop Advisory

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2%2B-EE4C2C?logo=pytorch)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4%2B-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Hackathon Theme:** Smart & Climate-Resilient Agriculture  
> **Target Audience:** Smallholder farmers, agricultural extension officers, and agronomists.

AgriVision is a production-quality, mobile-first web application that empowers farmers to diagnose crop diseases in milliseconds from leaf photos. Powered by a **pre-trained MobileNetV2 computer vision model (38 PlantVillage classes)** and explainable **Grad-CAM attention heatmaps**, it delivers instant, localized, low-cost organic and generic chemical treatment plans in both **English and Hindi**, complete with ₹/acre cost estimates and voice narration.

---

## 📸 Architecture Diagram

```
                                  AgriVision Architecture
               +-----------------------------------------------------------+
               |             React 18 + Vite + Tailwind CSS                |
               |  (Framer Motion, Lucide Icons, Recharts, Web Speech, PWA) |
               +-----------------------------+-----------------------------+
                                             |
                                 REST API / Multipart Upload
                                             |
                                             v
               +-----------------------------------------------------------+
               |                  FastAPI Backend Server                   |
               |  - /api/predict (Inference + Grad-CAM + Advisory)         |
               |  - /api/history & /api/stats (Scan logs & Analytics)      |
               |  - /api/health & /api/samples (Demo samples)              |
               +-------------+-------------------------------+-------------+
                             |                               |
                             v                               v
               +-----------------------------+ +---------------------------+
               |   PyTorch MobileNetV2 ML    | |   advisory.json (38 cls)  |
               |  Pretrained PlantVillage    | |   EN & HI treatment/cost  |
               |  + Grad-CAM Visual Heatmap  | +---------------------------+
               +-----------------------------+               |
                             |                               v
                             v                 +---------------------------+
               +-----------------------------+ |   SQLite DB (SQLAlchemy)  |
               |   Sample Leaf Images        | |  Scan History & Analytics |
               +-----------------------------+ +---------------------------+
```

---

## 🚀 Quick Start (One Command)

### macOS / Linux
```bash
./run.sh
```

### Windows
```cmd
run.bat
```

The script automatically sets up the Python virtual environment, installs backend and frontend packages, launches the FastAPI server on `http://127.0.0.1:8000`, and opens the Vite React UI on `http://localhost:5173`.

---

## 🛠️ Manual Step-by-Step Setup

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

Run the comprehensive pytest suite verifying API schemas, image validation, Grad-CAM generation, SQLite CRUD operations, and advisory completeness across all 38 classes:

```bash
source backend/.venv/bin/activate
pytest backend/test_api.py -v
```

---

## 🌟 Key Features

1. **38-Class PlantVillage Deep Vision Classifier**:
   - Covers 14 crops: Apple, Blueberry, Cherry, Corn (Maize), Grape, Orange (Citrus), Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash/Pumpkin, Strawberry, and Tomato.
   - Accurately classifies healthy leaves and common blights, rusts, mildews, molds, viral infections (TYLCV, ToMV), bacterial spots, and spider mite damage.

2. **Explainable AI (Grad-CAM Saliency Heatmaps)**:
   - Visualizes the convolutional feature activation gradients from the final residual layer of MobileNetV2.
   - Interactive blend opacity slider and side-by-side mode allowing farmers and agronomists to verify exactly where the AI detected pathogen lesions.

3. **Complete 38-Class Bilingual Knowledge Base (`advisory.json`)**:
   - Every single class is mapped with symptoms, causal agents, organic remedies (Neem, Jeevamrit, Trichoderma, Bacillus subtilis), generic chemical formulations (active ingredients like Mancozeb, Difenoconazole, Metalaxyl, Azoxystrobin), and ₹ INR estimated cost per acre.
   - 100% bilingual support in **English and Hindi (हिंदी)**.

4. **Web Speech Audio Advisory**:
   - "Listen" button reads the diagnostic report, symptoms, and spray protocols aloud in `hi-IN` or `en-IN` using native Web Speech synthesis for illiterate or visually challenged farmers.

5. **Low-Confidence Safeguard**:
   - If confidence match is < 60%, the system flags a gentle warning urging the user to retake a clearer, well-lit photo rather than acting on uncertain advice.

6. **Interactive "Ask AgriBot" Q&A Assistant**:
   - Integrated AI assistant with domain-specific agronomic intelligence. Answers questions about spray timing, rain-fastness, dilution formulas, and safety intervals in English and Hindi.

7. **Scan History & Analytics Dashboard**:
   - SQLite scan history with fast thumbnail previews and date stamps.
   - Recharts dashboard displaying disease frequency, healthy vs diseased ratios, and 7-day field activity trends.

8. **PWA & Offline Readiness**:
   - `manifest.json` and service worker caching static assets for low-connectivity rural field environments.

---

## 🎯 Live Demo Script for Judges

1. **Landing & Instant Sample Demo**:
   - Navigate to `http://localhost:5173`.
   - Toggle language between **English** and **हिंदी** in the navbar to demonstrate instant full-UI translation.
   - Click on the **"Tomato Early Blight"** demo sample leaf under the scanner.
   - Observe the animated scanning effect transition into the comprehensive Diagnostic Report.

2. **Grad-CAM & Explainability**:
   - Scroll down to the **Grad-CAM AI Attention Overlay**.
   - Move the blend slider between 0% (Original Leaf) and 100% (Heatmap) to show how the model isolates target-board necrotic rings.

3. **Audio Advisory**:
   - Click the **"Listen to Advisory"** / **"सलाह सुनें"** button to hear the audio narration.

4. **Treatment Tabs & Cost Breakdown**:
   - Toggle between **Organic**, **Generic Chemical** (noting the ₹450-₹650/acre cost estimate), and **Climate Prevention**.

5. **Ask AgriBot**:
   - Click on the suggested chip: *"How to prepare the organic neem solution?"* or type *"What if it rains after spraying?"* to see instant agronomic guidance.

6. **Field Analytics**:
   - Click **"Analytics"** in the navbar to inspect the Recharts dashboard with breakdown of scans and disease prevalence.

---

## 🧠 Model Training & Transfer Learning (`train.py`)

To fine-tune MobileNetV2 on a custom crop dataset:

```bash
source backend/.venv/bin/activate
python backend/train.py \
  --data_dir /path/to/plantvillage \
  --epochs 15 \
  --batch_size 32 \
  --lr 0.001 \
  --output_dir ./weights
```

---

## 🔮 Future Roadmap

- 📱 **WhatsApp & Telegram Bot Integration**: Enable farmers to send leaf photos directly over WhatsApp via Twilio/Meta API.
- 🚁 **Drone Imagery Integration**: Multi-spectral aerial crop scan processing for acre-scale blight heatmaps.
- 🗣️ **Regional Vernacular Expansion**: Add support for Punjabi, Marathi, Telugu, Tamil, Bengali, and Gujarati.
- 🤝 **FPO & Direct Generic Store Integration**: Direct link to local Krishi Vigyan Kendra (KVK) generic pesticide hubs for discounted group purchases.
