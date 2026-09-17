# AGENTS.md — AI Coding Assistant Guidelines

This document provides context, conventions, and operational guidelines for AI coding assistants (such as Antigravity, Claude Code, Cursor, and Copilot) working in the `Phishing-URLs-Extensions` repository.

---

## 1. Project Overview

`Phishing-URLs-Extensions` is an end-to-end Machine Learning-powered Google Chrome Extension (Manifest V3) that inspects web links for phishing threats in real time.

### Core Components
* **Frontend (`frontend/`)**: Google Chrome Extension built with React 19, Vite, and Tailwind CSS v4.
* **Backend (`backend/`)**: High-performance REST API built with FastAPI, served via Uvicorn, and deployed on Render.
* **Model Training (`model/`)**: Scikit-learn Pipeline (`CountVectorizer` + `LogisticRegression`) trained on 651k URLs from the Kaggle Malicious URLs dataset.

### Live Production Deployment
* **Backend API Base URL**: `https://phishing-urls-extensions.onrender.com`
* **Local Dev API Base URL**: `http://127.0.0.1:8000`
* **Health Check**: `GET /health`
* **Prediction Endpoint**: `POST /scan`

---

## 2. Repository Structure

```text
Phishing-URLs-Extensions/
├── backend/
│   ├── main.py                 # FastAPI application (lifespan, logging, CORS, /health, /scan)
│   ├── requirements.txt        # Backend dependencies (fastapi, uvicorn, scikit-learn, etc.)
│   ├── .python-version         # Pinned Python version (3.11.9)
│   ├── phishing.pkl            # Trained Scikit-learn model pipeline
│   └── tests/
│       ├── __init__.py
│       └── test_main.py        # Automated Pytest suite
├── model/
│   ├── train.py                # Dataset cleaning, pipeline training, and evaluation script
│   ├── requirements.txt        # Training dependencies (pandas, scikit-learn, nltk)
│   └── malicious_phish.csv     # 651k URLs Kaggle dataset (git-ignored)
├── frontend/
│   ├── public/
│   │   ├── manifest.json       # Chrome Extension Manifest V3 configuration
│   │   ├── icon16.png
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/             # Logos and vector icons
│   │   ├── components/         # React components (ScanPage, ScanUrl, StatusBadge, etc.)
│   │   ├── config/api.js       # Centralized API configuration (reads VITE_API_URL)
│   │   ├── hooks/usePhishingApi.js  # Custom hook for API interactions
│   │   ├── background.js       # Extension service worker
│   │   ├── App.jsx             # Main popup application
│   │   └── main.jsx
│   ├── .env.example            # Environment template pointing to Render production URL
│   ├── package.json
│   └── vite.config.js
├── pytest.ini                  # Pytest configuration (pythonpath = .)
├── render.yaml                 # Render Blueprint Infrastructure-as-Code
└── .python-version             # Repository-level Python pin (3.11.9)
```

---

## 3. Essential Commands

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build extension for Chrome (output to frontend/dist/)
npm run build

# Run linter
npm run lint
```
> **Testing Extension in Chrome**: Navigate to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `frontend/dist/` directory.

### Backend Development & Testing
```bash
# Activate virtual environment
.venv\Scripts\activate       # Windows PowerShell / CMD
# or source .venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r backend/requirements.txt

# Run automated unit tests
pytest -v

# Start local API server
python -m uvicorn backend.main:app --reload --port 8000
# or from inside backend/:
# cd backend && python -m uvicorn main:app --reload --port 8000
```

### Model Retraining
```bash
# Retrain model from model/malicious_phish.csv
pip install -r model/requirements.txt
python model/train.py
```
> Outputs evaluated model directly to `backend/phishing.pkl`.

---

## 4. Architectural & Coding Conventions

### Backend (FastAPI)
1. **Lifespan Management**:
   * Do **NOT** load large files or ML models at module top-level import time.
   * Always use the `@asynccontextmanager async def lifespan(app: FastAPI)` context manager.
   * Access the model via `request.app.state.model`.
2. **Logging**:
   * Do **NOT** use `print()` in production backend code.
   * Use Python's standard `logging` module (`logger = logging.getLogger("phishing_api")`).
3. **Model Prediction Contract**:
   * The binary classification model has classes `['bad', 'good']` sorted alphabetically.
   * `proba[0]` corresponds to class `'bad'` (Phishing / Malicious).
   * `proba[1]` corresponds to class `'good'` (Legitimate / Benign).
   * Threshold: `is_phishing = proba[0] > 0.5`.
   * Never change this order without updating the frontend contract.
4. **Testing**:
   * Maintain tests in `backend/tests/test_main.py`.
   * Ensure tests pass via `pytest -v` before committing backend changes.

### Frontend (React + Chrome Extension)
1. **Manifest V3 Compliance**:
   * All background tasks must run in `background.js` as an ES module service worker.
   * Do not use eval or remote code execution.
2. **Configuration**:
   * Do not hardcode API endpoints in components.
   * All API calls must use `ENDPOINTS` from `frontend/src/config/api.js`.
   * Configure environment URLs in `frontend/.env` using `VITE_API_URL`.
3. **Styling & UI**:
   * Use Tailwind CSS v4 utility classes.
   * Use `lucide-react` for interface icons.

---

## 5. Git & Deployment Policies

1. **Model Tracking (`phishing.pkl`)**:
   * `backend/phishing.pkl` (~8.8 MB) **must be tracked in Git** (`!backend/phishing.pkl` in `.gitignore`) so Render can load it during container builds without needing external cloud storage.
2. **Dataset Exclusion**:
   * Never commit raw datasets (`model/*.csv`). `malicious_phish.csv` is ~45 MB and must stay ignored.
3. **Python Runtime Pinning**:
   * Always pin Python to `3.11.9` (`.python-version` and `PYTHON_VERSION: 3.11.9` in `render.yaml`) to avoid missing pre-built binary wheels on Render (e.g. Python 3.14 build errors).
4. **Pre-commit Checklist**:
   - [ ] Run `pytest -v` (all tests pass).
   - [ ] Run `npm run build` in `frontend` (dist builds cleanly).
   - [ ] Verify `git status` contains no secrets, cache directories, or untracked temporary files.
