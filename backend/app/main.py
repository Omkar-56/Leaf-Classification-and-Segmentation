import tensorflow as tf
import numpy as np
from fastapi import FastAPI, File, UploadFile
import cv2 as cv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.classify import classify_image
from app.segment import segment

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI!"}


@app.post("/predict")
def read_file(file: UploadFile = File(...)):
    c_output = classify_image(file)
    s_output = segment(file)
    file.file.close()
    return JSONResponse(content={
        "classification": c_output,
        "segmentation": s_output
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)