import os
import pickle
import logging
import warnings
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Suppress sklearn version mismatch warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Configure logging according to production best practice
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("phishing_api")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing.pkl")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Loads ML model into app.state on startup and cleans up on shutdown.
    """
    logger.info("Loading ML model from %s...", MODEL_PATH)
    if not os.path.exists(MODEL_PATH):
        logger.error("Model file not found at %s", MODEL_PATH)
        raise RuntimeError(f"Model file not found at {MODEL_PATH}")

    with open(MODEL_PATH, "rb") as f:
        app.state.model = pickle.load(f)

    logger.info("Model loaded successfully into app.state.model.")
    yield
    logger.info("Shutting down Phishing URL Detector API.")


# FastAPI app with OpenAPI documentation metadata and lifespan context manager
app = FastAPI(
    title="Phishing URL Detector API",
    description="High-performance API for analyzing URLs and detecting phishing threats.",
    version="2.0.0",
    lifespan=lifespan,
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
    urls: List[str] = Field(..., description="List of URLs to scan")


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
async def scan(payload: ScanRequest, request: Request):
    if not payload.urls:
        return {"status": "success", "count": 0, "results": []}

    # Retrieve model from app.state
    model = getattr(request.app.state, "model", None)

    if model is None:
        logger.error("Prediction model is not initialized on app.state")
        raise HTTPException(status_code=503, detail="Prediction model is not loaded.")

    try:
        probas = model.predict_proba(payload.urls)
        results = []
        phishing_count = 0

        for url, proba in zip(payload.urls, probas):
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

        logger.info("[/scan] Processed %d URL(s), found %d phishing", len(payload.urls), phishing_count)
        return {
            "status": "success",
            "count": phishing_count,
            "results": results,
        }
    except Exception as e:
        logger.exception("Prediction failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")