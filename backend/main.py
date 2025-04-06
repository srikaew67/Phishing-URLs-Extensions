from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Can be restricted to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

@app.post("/scan-url")  # Ensure this route is defined with POST method
async def scan_url(request: URLRequest):
    # Process the URL or do the phishing check
    print(f"Received URL: {request.url}")
    return {"message": "URL received"}
