# BioBytes Medical AI Microservice (PyTorch, TorchXRayVision, MONAI)

This Python microservice acts as the dedicated AI processing engine for BioBytes. It processes 2D Chest X-Rays using **TorchXRayVision** and 3D CT/MRI scans using **MONAI**, returning structured JSON pathology metrics.

## Architecture

- **Framework**: FastAPI + Uvicorn
- **2D Chest X-Rays**: TorchXRayVision (DenseNet-121 pre-trained multi-dataset model)
- **3D CT / MRI Scans**: MONAI 3D Transform & Volumetric Segmentation Pipeline
- **Port**: `8000` (bridged via Next.js `/api/analyze-scan`)

## Quickstart

### 1. Create Virtual Environment & Install Dependencies
```bash
cd ai-microservice
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Start Microservice
```bash
uvicorn main:app --reload --port 8000
```

### 3. API Endpoints
- `GET http://localhost:8000/health`: Microservice health check
- `POST http://localhost:8000/analyze/xray`: TorchXRayVision 2D Chest X-Ray inference
- `POST http://localhost:8000/analyze/ct-scan`: MONAI 3D DICOM / NIfTI volume segmentation
- `POST http://localhost:8000/analyze/scan`: Unified router auto-detecting file format
