from fastapi import FastAPI , Body
from pydantic import BaseModel
from typing import List
from transformers import DistilBertTokenizer
import tensorflow as tf

# Load model from SavedModel directory
model = tf.saved_model.load("models/distilbert_url_classifier")
predict_fn = model.signatures["serving_default"]

# Load tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("models/distilbert_tokenizer")

# FastAPI app
app = FastAPI()

# Input schema
class URLInput(BaseModel):
    url: str

class MultipleUrlsRequest(BaseModel):
    urls: List[str]

# Prediction logic
def predict(url: str):
    # Tokenize the URL
    inputs = tokenizer(
        url,
        padding="max_length",
        truncation=True,
        max_length=64,
        return_tensors="tf"
    )

    # Prepare model inputs - match expected names
    model_inputs = {
        "inputs": inputs["input_ids"],
        "inputs_1": inputs["attention_mask"]
    }

    # Run prediction
    outputs = predict_fn(**model_inputs)

    # Extract probability from model output
    prob = float(outputs["output"].numpy()[0][0])
    prediction = "Phishing" if prob > 0.5 else "Legitimate"
    confidence = max(prob, 1 - prob)

    return {
        "url": url,
        "probability": prob,
        "prediction": prediction,
        "confidence": confidence
    }

# Predict endpoint
@app.post("/url")
async def predict_url(request: URLInput):
    url = request.url
    print(f"Received URL: {url}")
    result = predict(url)
    print(result)
    return {
        "status": "success",
        "result": result
    }

@app.post("/urls")
async def predict_urls(request: MultipleUrlsRequest):
    results = []
    for url in request.urls:
        result = predict(url)
        results.append(result)
        print(result)
    return {
        "status": "success",
        "count": len(list(filter(lambda r: r["prediction"] == "Phishing", results))),
        "results": results
    }