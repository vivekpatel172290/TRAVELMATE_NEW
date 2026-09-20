# TravelMate — Delhi Tourist Trust & Safety Layer
### Official Delhi NCR Tourist Safety Ecosystem

> **Core Philosophy:** One tourist → One temporary Journey ID → connects Verified Destination → Official Ticket Source → SafeVisit Pass → Fair Fare Check → Language Support → Journey Safety → Evidence Vault → Incident Resolution.

---

## 🏛️ Architecture Overview

TravelMate consists of 3 integrated layers:
1. **Frontend (Port 5173)**: React + Vite + Tailwind CSS with dark glassmorphism, Google Maps route tracker, DeviceMotionEvent silent shake SOS, and SafeVisit QR pass.
2. **Backend REST API (Port 5000)**: Node.js + Express + PostgreSQL schema (Supabase ready with resilient in-memory local data store).
3. **AI Microservice (Port 8000)**: Python 3.13 + FastAPI + Anthropic Claude 3.5 Sonnet RAG engine grounded strictly in verified Delhi monuments and emergency helplines + Vehicle Plate OCR.

---

## 🚀 Quick Start Guide

### 1. Start Backend API (Port 5000)
```powershell
cd backend
npm.cmd run dev
```

### 2. Start AI Decision-Support Service (Port 8000)
```powershell
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend Dashboard (Port 5173)
```powershell
cd frontend
npm.cmd run dev
```

Visit **http://localhost:5173** in your browser!

---

## 🛡️ Core Features Included (Delhi-First MVP)
- **SafeVisit Pass**: Temporary 7-day QR Journey ID without passport uploads.
- **10 Verified Delhi Monuments**: ASI-verified pricing (Indian vs Foreigner), official ticketing links (`asi.payumoney.com`), and scam advisories.
- **Fair Fare Meter**: Official Delhi Transport Department benchmark model (Auto vs Non-AC/AC taxi) with non-accusatory discrepancy warnings.
- **RideSafe Evidence Vault**: Vehicle photo upload with OCR license plate reader requiring **mandatory tourist confirmation**.
- **Claude Grounded Chatbot**: Zero-hallucination RAG grounded strictly in local knowledge base.
- **Safe Journey & Risk Overlay**: Google Directions route monitor with soft deviation prompt (>500m) and NCRB crime risk overlay.
- **Emergency SOS & Silent Gesture**: 1-tap 112 dispatch + shake gesture detection via `DeviceMotionEvent`.
- **Human Admin Dashboard**: Incident review, place data freshness audit, and flagged fare dispute log.
