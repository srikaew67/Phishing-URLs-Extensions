# Phishing URLs Detection — Browser Extension

Extension สำหรับ Chrome ที่ตรวจจับ URL ที่อาจเป็น Phishing บนหน้าเว็บที่กำลังเปิดอยู่ หรือจาก URL ที่กรอกเอง ด้วยโมเดล Machine Learning (Logistic Regression + CountVectorizer) ที่ฝึกด้วย scikit-learn และ serve ผ่าน FastAPI

---

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                Browser Extension (Frontend)                │
│             React 19 + Vite + Tailwind CSS v4              │
│                                                            │
│   ┌───────────────────────┐    ┌───────────────────────┐   │
│   │    Scan this page     │    │       Scan URL        │   │
│   │───────────────────────│    │───────────────────────│   │
│   │  Extracts all links   │    │  Manual URL input     │   │
│   │  from the active tab  │    │  Inspects single link │   │
│   │  Batch URL analysis   │    │  Instant confidence   │   │
│   └───────────┬───────────┘    └───────────┬───────────┘   │
└───────────────┼────────────────────────────┼───────────────┘
                │                            │
                │  POST /scan {urls: [...]}  │  POST /scan {urls: ["..."]}
                │                            │
┌───────────────▼────────────────────────────▼───────────────┐
│            Backend API (FastAPI + Render)                  │
│        https://phishing-urls-extensions.onrender.com       │
│          Local Development: http://127.0.0.1:8000          │
│                                                            │
│    GET  /health  → Health check status                     │
│    POST /scan    → Batch & single URL phishing prediction  │
│                                                            │
│    ┌──────────────────────────────────────────────────┐    │
│    │                  phishing.pkl                    │    │
│    │   CountVectorizer + LogisticRegression Pipeline  │    │
│    │    - Trained on 651k URLs (Accuracy ~92.5%) -    │    │
│    │           Managed via FastAPI Lifespan           │    │
│    └──────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## โครงสร้างโปรเจกต์

```text
Phishing-URLs-Extensions/
├── backend/
│   ├── main.py                 # FastAPI app (lifespan, logging, CORS, /health, /scan)
│   ├── requirements.txt
│   ├── .python-version         # Pinned Python 3.11.9 for deployment
│   ├── phishing.pkl            # ML model
│   └── tests/                  # Automated unit test suite
│       ├── __init__.py
│       └── test_main.py        # Pytest test cases
├── model/
│   ├── train.py                # Scikit-learn pipeline
│   ├── requirements.txt        # Dependencies
│   └── malicious_phish.csv     # Kaggle dataset 651k URLs 
├── frontend/
│   ├── public/
│   │   ├── manifest.json       # Chrome Extension Manifest v3
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── src/
│   │   ├── assets/
│   │   │   └── Logo.svg
│   │   ├── config/
│   │   │   └── api.js          # Centralized API endpoint config
│   │   ├── hooks/
│   │   │   └── usePhishingApi.js   # Custom hook สำหรับ API calls
│   │   ├── components/
│   │   │   ├── ScanPage.jsx    # สแกน links ทั้งหมดบนหน้าที่เปิดอยู่
│   │   │   ├── ScanUrl.jsx     # สแกน URL เดียวที่กรอกเอง
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── StatusBadge.jsx # แสดงผล Safe / Phishing
│   │   ├── App.jsx             # Root component + Tab navigation
│   │   ├── App.css             # Tailwind import
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── background.js       # Chrome Extension Service Worker
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── pytest.ini                  # Pytest configuration
├── render.yaml                 # Render Configuration
└── .python-version             # Python version pin (3.11.9)
```

---

## ฟีเจอร์หลัก

- **Scan this page** — ดึง external link ทั้งหมดจากหน้าเว็บปัจจุบัน แล้วส่งตรวจ Phishing พร้อมกัน
- **Scan URL** — กรอก URL เองและตรวจสอบทีละ URL พร้อมแสดง confidence score
- **ซ่อน/แสดงใน Browser** — ซ่อน link ที่ตรวจพบว่าเป็น Phishing บนหน้าเว็บได้ทันที
- **Backend Status Indicator** — แสดงสถานะการเชื่อมต่อ backend
- **Confidence Score** — แสดงความมั่นใจของโมเดล (%) ในการวิเคราะห์แต่ละ URL

---

## ชุดข้อมูลและโมเดล (Dataset & Model)

โปรเจกต์นี้ฝึกโมเดล Machine Learning โดยใช้ชุดข้อมูลจาก Kaggle:

- **Dataset**: [Malicious URLs dataset](https://www.kaggle.com/datasets/sid321axn/malicious-urls-dataset/data?select=malicious_phish.csv) เผยแพร่โดย **Manu Siddhartha** ([@sid321axn](https://www.kaggle.com/sid321axn)) บน Kaggle
  - **ไฟล์ที่ใช้**: `malicious_phish.csv` (จำนวน **651,191 รายการ**)
  - **โครงสร้างคลาสเดิม**: `benign` (428,103), `defacement` (96,457), `phishing` (94,111), `malware` (32,520)
  - **การปรับใช้ในระบบ**: แมป `benign` $\rightarrow$ `good` (ปลอดภัย) และรวมกลุ่มภัยคุกคาม (`phishing`, `defacement`, `malware`) $\rightarrow$ `bad` (เสี่ยง/Phishing)
- **Reference & Inspiration**: [Phishing Sites Detector - Complete Info](https://www.kaggle.com/code/taruntiwarihp/phishing-sites-detector-complete-info#Read-My-Article-on-Medium-here) โดย Tarun Tiwari
- **Model Pipeline**: พัฒนาด้วย `scikit-learn` Pipeline ประกอบด้วย:
  - **Feature Extraction**: `CountVectorizer` (คัดกรองคำด้วย Token Pattern และตัด Protocol Stop Words ออกเพื่อลด Bias)
  - **Classifier**: `LogisticRegression` สำหรับการทำ Binary Classification (`bad` / `good` → Phishing / Legitimate) แม่นยำ ~92.5% บนชุดทดสอบ 1.3 แสนรายการ

---

## API ของ Backend

| Method | Path | หน้าที่ | Request Body | Response |
|--------|------|---------|-------------|----------|
| `GET` | `/health` | ตรวจสถานะ backend | — | `{ "status": "ok" }` |
| `POST` | `/scan` | วิเคราะห์ความเสี่ยง URL (รับเป็น List) | `{ "urls": ["https://example.com"] }` | `{ "status", "count", "results": [...] }` |

### ตัวอย่าง Request Body

```json
{
  "urls": [
    "https://example.com",
    "https://phishing.site"
  ]
}
```

### ตัวอย่าง Response

```json
{
  "status": "success",
  "count": 1,
  "results": [
    {
      "url": "https://example.com",
      "prediction": "Legitimate",
      "confidence": 0.97,
      "probability": 0.03
    },
    {
      "url": "https://phishing.site",
      "prediction": "Phishing",
      "confidence": 0.92,
      "probability": 0.92
    }
  ]
}
```

---

## เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น

- **Node.js** 18+
- **Python** 3.11
- ไฟล์ `backend/phishing.pkl`

---

### การเทรนโมเดล (Model Training)

หากต้องการฝึกโมเดลใหม่จากชุดข้อมูล [malicious_phish.csv](model/malicious_phish.csv):

```bash
pip install -r model/requirements.txt
python model/train.py
```
> สคริปต์จะทำการแมปคลาส แบ่ง Train/Test 80/20 ประเมิน Accuracy (~92.5%) และบันทึกโมเดลไปที่ `backend/phishing.pkl` โดยอัตโนมัติ

---

### Backend Setup (Local)

#### 1. เข้าไปที่ backend directory

```bash
cd backend
```

#### 2. ติดตั้ง Python dependencies

```bash
pip install -r requirements.txt
```

#### 3. รัน Unit Tests (Automated Testing)

```bash
pytest -v
```
> ทดสอบ Endpoint `/health`, Edge cases และการจำแนกประเภท URL ด้วย `pytest` และ `httpx`

#### 4. รัน API server แบบ Local

```bash
python -m uvicorn main:app --reload --port 8000
```

API จะพร้อมใช้งานที่ `http://127.0.0.1:8000`

---


### Frontend Setup

#### 1. เข้าไปที่ frontend directory

```bash
cd frontend
```

#### 2. ตั้งค่า Environment Variables (ถ้าจำเป็น)

```bash
cp .env.example .env
# ปรับ VITE_API_URL ตามต้องการ (ค่าเริ่มต้นชี้ไปที่ Render Cloud API)
```

| Variable | Default (.env.example) | คำอธิบาย |
|----------|------------------------|----------|
| `VITE_API_URL` | `https://phishing-urls-extensions.onrender.com` | Base URL ของ backend API (หรือเปลี่ยนเป็น `http://127.0.0.1:8000` สำหรับ local dev) |

#### 3. ติดตั้ง dependencies

```bash
npm install
```

#### 4. Build Extension

```bash
npm run build
```

ไฟล์ extension จะถูก generate ไว้ที่ `frontend/dist/`

---

## โหลด Extension เข้า Chrome

1. เปิด Chrome แล้วไปที่ `chrome://extensions`
2. เปิด **Developer mode** (toggle มุมขวาบน)
3. คลิก **Load unpacked** แล้วเลือก folder `frontend/dist/`
4. Extension จะปรากฏใน toolbar พร้อมใช้งานทันที

> **หมายเหตุ:** Extension สามารถเชื่อมต่อกับ Production API บน Render ได้โดยตรง หากต้องการทดสอบ Local ให้แก้ไข `VITE_API_URL` ใน `frontend/.env` แล้วสั่ง `npm run build` ใหม่

---

## Tech Stack

### Frontend

| เทคโนโลยี | เวอร์ชัน | บทบาท |
|-----------|---------|-------|
| React | 19 | UI Framework |
| Vite | 6 | Build tool + Dev server |
| Tailwind CSS | 4 | Styling |
| Lucide React | 0.483 | Icons |
| Framer Motion | 12 | Page transition animation |
| Chrome Extension Manifest | v3 | Extension platform |

### Backend

| เทคโนโลยี | เวอร์ชัน | บทบาท |
|-----------|---------|-------|
| Python | 3.11.9 | Runtime |
| FastAPI | 0.115 | Web framework (Lifespan Context Manager) |
| Uvicorn | 0.34 | ASGI server |
| scikit-learn | 1.9+ | ML model (CountVectorizer + LogisticRegression Pipeline) |
| Pydantic | 2.10 | Request/Response validation |
| Pytest | 9.1 | Automated Unit Testing |
| HTTPX | 0.28 | Async TestClient dependency |
| Render | Cloud | Hosting Platform (Singapore Region) |

---


## แนวทางพัฒนาต่อ

- [ ] เพิ่ม **Whitelist** ให้ผู้ใช้สามารถ mark URL ว่าปลอดภัยได้
- [ ] เพิ่ม **ประวัติการตรวจ** URL ที่เคยสแกนไว้
- [ ] เปลี่ยนเป็น Model LLM เพื่อความแม่นยำสูงขึ้น
