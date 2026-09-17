import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_scan_empty_urls(client):
    response = client.post("/scan", json={"urls": []})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 0
    assert data["results"] == []

def test_scan_prediction_legitimate_and_phishing(client):
    urls = [
        "https://en.wikipedia.org/wiki/Main_Page",
        "http://bankofamerica-verify-login.com/security"
    ]
    response = client.post("/scan", json={"urls": urls})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 1
    assert len(data["results"]) == 2

    # Check legitimate result
    legit = data["results"][0]
    assert legit["url"] == urls[0]
    assert legit["prediction"] == "Legitimate"
    assert legit["confidence"] > 0.5
    assert 0.0 <= legit["probability"] <= 0.5

    # Check phishing result
    phish = data["results"][1]
    assert phish["url"] == urls[1]
    assert phish["prediction"] == "Phishing"
    assert phish["confidence"] > 0.5
    assert 0.5 < phish["probability"] <= 1.0

def test_app_state_model_loaded(client):
    # Verify model is properly stored on app.state
    assert hasattr(app.state, "model")
    assert app.state.model is not None
    assert hasattr(app.state.model, "predict_proba")
