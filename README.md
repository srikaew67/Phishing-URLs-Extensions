# Phishing URLs Detection — Browser Extension

Extension สำหรับ Chrome ที่ตรวจจับ URL ที่อาจเป็น Phishing บนหน้าเว็บที่กำลังเปิดอยู่ หรือจาก URL ที่กรอกเอง ขับเคลื่อนด้วยโมเดล Machine Learning (Logistic Regression + CountVectorizer) ที่ฝึกด้วย scikit-learn และ serve ผ่าน FastAPI

---

## สถาปัตยกรรมระบบ

```
┌──────────────────────────────────────────────────────────┐
│                 Browser Extension (Frontend)             │
│          React 19 + Vite + Tailwind CSS v4               │
│                                                          │
│  ┌─────────────────┐     ┌──────────────────────────┐   │
│  │  Scan this page │     │       Scan URL            │   │
│  │  ─────────────  │     │  ──────────────────────   │   │
│  │  ดึง external   │     │  รับ URL ที่ผู้ใช้กรอก    │   │
│  │  links จากหน้า  │     │  ส่งเป็น list 1 รายการ   │   │
│  │  ส่งตรวจทั้งหมด │     │                          │   │
│  └────────┬────────┘     └────────────┬──────────────┘   │
└───────────┼──────────────────────────┼──────────────────┘
            │ POST /scan {urls: [...]} │ POST /scan {urls: ["..."]}
            │                          │
┌───────────▼──────────────────────────▼──────────────────┐
│                      Backend (FastAPI)                   │
│                   Python + scikit-learn                  │
│                   localhost:8000                         │
│                                                          │
│  GET  /health     → ตรวจสอบสถานะ backend               │
│  POST /scan       → รับ Payload รูปแบบ List ({urls: [...]})│
│                     คืนค่าผลการทำนายในรูปแบบ List       │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │            phishing.pkl (ML Model)                │  │
│  │   CountVectorizer + Logistic Regression Pipeline  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## โครงสร้างโปรเจกต์

```text
Phishing-URLs-Extensions/
├── backend/
│   ├── main.py                 # FastAPI app (CORS, /health, /scan)
│   ├── requirements.txt
│   └── phishing.pkl            # ML model (ไม่ได้ commit ขึ้น git)
└── frontend/
    ├── public/
    │   ├── manifest.json       # Chrome Extension Manifest v3
    │   ├── icon16.png
    │   ├── icon48.png
    │   └── icon128.png
    ├── src/
    │   ├── assets/
    │   │   └── Logo.svg
    │   ├── config/
    │   │   └── api.js          # Centralized API endpoint config
    │   ├── hooks/
    │   │   └── usePhishingApi.js   # Custom hook สำหรับ API calls
    │   ├── components/
    │   │   ├── ScanPage.jsx    # สแกน links ทั้งหมดบนหน้าที่เปิดอยู่
    │   │   ├── ScanUrl.jsx     # สแกน URL เดียวที่กรอกเอง
    │   │   ├── LoadingSpinner.jsx
    │   │   └── StatusBadge.jsx # แสดงผล Safe / Phishing
    │   ├── App.jsx             # Root component + Tab navigation
    │   ├── App.css             # Tailwind import + url-scroll helper
    │   ├── index.css
    │   ├── main.jsx
    │   └── background.js       # Chrome Extension Service Worker
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## ฟีเจอร์หลัก

- **Scan this page** — ดึง external link ทั้งหมดจากหน้าเว็บปัจจุบัน แล้วส่งตรวจ Phishing พร้อมกัน
- **Scan URL** — กรอก URL เองและตรวจสอบทีละ URL พร้อมแสดง confidence score
- **ซ่อน/แสดงใน Browser** — ซ่อน link ที่ตรวจพบว่าเป็น Phishing บนหน้าเว็บได้ทันที
- **Backend Status Indicator** — แสดงสถานะการเชื่อมต่อ backend (Online / Offline) แบบ real-time
- **Confidence Score** — แสดงความมั่นใจของโมเดล (%) ในการวิเคราะห์แต่ละ URL

---

## ชุดข้อมูลและโมเดล (Dataset & Model)

โปรเจกต์นี้เทรนโมเดล Machine Learning โดยอ้างอิงและใช้ชุดข้อมูล Phishing URLs จาก Kaggle:

- **Dataset / Reference Link**: [Phishing Sites Detector - Complete Info (Kaggle)](https://www.kaggle.com/code/taruntiwarihp/phishing-sites-detector-complete-info#Read-My-Article-on-Medium-here)
- **Model Pipeline**: `scikit-learn` Pipeline ประกอบด้วย:
  - **Feature Extraction**: `CountVectorizer` สำหรับแปลงลักษณะข้อความของ URL เป็น Feature Vectors
  - **Classifier**: `LogisticRegression` สำหรับทำ Binary Classification (`bad` / `good` → Phishing / Legitimate)

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
- **Python** 3.9–3.11
- ไฟล์ `phishing.pkl` (ML model ที่ฝึกไว้แล้ว)

---

### Backend Setup

#### 1. เข้าไปที่ backend directory

```bash
cd backend
```

#### 2. ติดตั้ง Python dependencies

```bash
pip install -r requirements.txt
```

#### 3. วาง model ไว้ใน backend/

```
backend/
└── phishing.pkl    ← ไฟล์ ML model (CountVectorizer + LogisticRegression Pipeline)
```

#### 4. รัน API server

```bash
cd backend
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
# แก้ไข VITE_API_URL หาก backend รันอยู่บน port อื่น
```

| Variable | Default | คำอธิบาย |
|----------|---------|----------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Base URL ของ backend API |

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
4. Extension จะปรากฏใน toolbar พร้อมใช้งาน

> **หมายเหตุ:** ต้องรัน backend ก่อนทุกครั้งที่จะใช้ extension

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
| Python | 3.9–3.11 | Runtime |
| FastAPI | 0.115 | Web framework |
| Uvicorn | 0.34 | ASGI server |
| scikit-learn | latest | ML model (CountVectorizer + LogisticRegression) |
| Pydantic | 2 | Request/Response validation |

---

## สิ่งที่ได้เรียนรู้จากโปรเจกต์นี้

โปรเจกต์นี้รวมการพัฒนาหลายส่วนเข้าด้วยกัน ตั้งแต่การฝึก ML model ด้วย scikit-learn จากชุดข้อมูล Kaggle การ serve ผ่าน FastAPI การสร้าง Chrome Extension ด้วย Manifest v3 และการ inject script เข้าไปใน browser page จุดที่น่าสนใจคือการใช้ `chrome.scripting.executeScript` เพื่อดึง external links และซ่อน phishing links บนหน้าเว็บจริงได้โดยตรงจาก extension popup

---

## แนวทางพัฒนาต่อ

- เพิ่ม **Whitelist** ให้ผู้ใช้สามารถ mark URL ว่าปลอดภัยได้
- เพิ่ม **ประวัติการตรวจ** URL ที่เคยสแกนไว้
- เปลี่ยนโมเดลเป็น **DistilBERT** หรือ Transformer-based model เพื่อความแม่นยำสูงขึ้น
- เพิ่ม **context menu** ให้คลิกขวาที่ link แล้วตรวจได้เลย
- รองรับ **Firefox** ผ่าน WebExtensions API
- เพิ่ม **unit test** สำหรับ prediction logic และ frontend hook
