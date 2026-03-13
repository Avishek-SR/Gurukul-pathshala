import base64
import os
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace

app = FastAPI(title="Gurukul Pathshala DeepFace API")

# Setup CORS to allow React frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image: str # Base64 encoded image string
    model_name: str = "ArcFace"

def decode_base64_image(base64_string: str) -> np.ndarray:
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from base64")
        return img
    except Exception as e:
        raise ValueError(f"Invalid base64 image: {str(e)}")

@app.post("/extract")
async def extract_face(request: ImageRequest):
    try:
        # 1. Decode base64 image
        img = decode_base64_image(request.image)
        
        # 2. Extract embedding using DeepFace
        # enforce_detection=True will throw an exception if no face is detected
        results = DeepFace.represent(img_path=img, model_name=request.model_name, enforce_detection=True)
        
        if not results or len(results) == 0:
            return {"success": False, "error": "No face detected"}
            
        # Return the embedding vector of the primary/largest face
        embedding = results[0]["embedding"]
        
        return {
            "success": True, 
            "embedding": embedding
        }
    except ValueError as e:
        if "Face could not be detected" in str(e):
             return {"success": False, "error": "No face detected in the frame. Please look at the camera."}
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Catch other errors, e.g., deepface initialization or model downloading
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "DeepFace Python API is running"}
