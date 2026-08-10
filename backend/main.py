from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import pickle
import warnings

# Suppress sklearn version mismatch warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Load model from pickle file
with open("phishing.pkl", "rb") as f:
    model = pickle.load(f)

# FastAPI app with OpenAPI documentation metadata
app = FastAPI(
    title="Phishing URL Detector API",
    description="High-performance API for analyzing URLs and detecting phishing threats.",
    version="2.0.0",
)

# CORS — allow browser extensions and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input schema
class ScanRequest(BaseModel):
    urls: List[str]


# Output schemas for API documentation
class URLResult(BaseModel):
    url: str
    probability: float
    prediction: str
    confidence: float


class ScanResponse(BaseModel):
    status: str
    count: int
    results: List[URLResult]


# Health check endpoint
@app.get("/health", summary="Health Check")
async def health():
    return {"status": "ok"}


@app.post("/scan", response_model=ScanResponse, summary="Scan URLs for Phishing")
async def scan(request: ScanRequest):
    if not request.urls:
        return {"status": "success", "count": 0, "results": []}

    try:
        probas = model.predict_proba(request.urls)
        results = []
        phishing_count = 0

        for url, proba in zip(request.urls, probas):
            prob_phishing = float(proba[0])  # index 0 = bad (phishing)
            is_phishing = prob_phishing > 0.5
            if is_phishing:
                phishing_count += 1

            results.append({
                "url": url,
                "probability": prob_phishing,
                "prediction": "Phishing" if is_phishing else "Legitimate",
                "confidence": max(prob_phishing, 1.0 - prob_phishing),
            })

        print(f"[/scan] Processed {len(request.urls)} URL(s), found {phishing_count} phishing")
        return {
            "status": "success",
            "count": phishing_count,
            "results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")