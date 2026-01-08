import tensorflow as tf
from keras.models import load_model
from keras.utils import load_img, img_to_array
import numpy as np
import io
from fastapi import UploadFile

model = load_model("models/classifier/best.keras")

class_names = ["Early Blight", "Healthy", "Late Blight"]
description = {
    "Early Blight": "A common fungal disease caused by Alternaria solani, affecting older leaves of the plant first.",
    "Healthy": "The plant is in good condition, showing no signs of disease.",
    "Late Blight": "A serious disease caused by Phytophthora infestans, affecting both leaves and tubers, leading to significant crop loss."
}

def classify_image(image: UploadFile):

    image_bytes = image.file.read()
    image.file.seek(0)
    img = load_img(io.BytesIO(image_bytes), target_size=(256, 256))
    img_array = img_to_array(img)
    img_array = tf.expand_dims(img_array, axis=0) 

    predictions = model.predict(img_array)
    pred_index = np.argmax(predictions[0])
    p_class = class_names[pred_index]
    confidence = float(predictions[0][pred_index] * 100)

    return p_class, confidence, description[p_class]
