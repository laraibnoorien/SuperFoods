# backend/main.py
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from analysis_pipeline import analyze_meal

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    portion: float = Form(1.0),
    conditions: str = Form("")   # e.g. "diabetic,high_bp"
):
    image_bytes = await file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    conditions_list = [c.strip() for c in conditions.split(",") if c.strip()]

    result = analyze_meal(img, portion, conditions_list)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
