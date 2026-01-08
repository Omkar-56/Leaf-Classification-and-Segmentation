import numpy as np
import cv2
import base64
from keras.models import load_model
from fastapi import UploadFile

model = load_model("models/segmenter/best.keras")

def segment(image: UploadFile):
    # Read and decode image
    image_bytes = image.file.read()
    image.file.seek(0)
    npimg = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)  # shape: (H, W, 3)

    original_img = cv2.resize(img, (256, 256))
    input_img = original_img / 255.0  # Normalize
    input_img = np.expand_dims(input_img, axis=0)  # (1, 256, 256, 3)

    # Predict mask
    pred = model.predict(input_img)
    binary_mask = (pred[0, :, :, 0] > 0.5).astype(np.uint8)

    # Create colored mask
    colored_mask = np.zeros_like(original_img)
    colored_mask[binary_mask == 1] = [0, 0, 255]  # Red in BGR

    # Overlay the mask on the original image
    blended_image = cv2.addWeighted(original_img, 1.0, colored_mask, 0.5, 0)

    # Encode the result as base64 string
    _, buffer = cv2.imencode('.jpg', blended_image)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return encoded_img
