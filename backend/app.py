import os
import time
import logging
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import cv2
import tensorflow as tf  
import json

from utils.image_utils import allowed_file, validate_image_file, save_upload



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
MODEL_PATH = os.path.join(BASE_DIR, 'tomato_model.tflite')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)



logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  #10MB limit

#load model

logger.info("Loading TFLite model using TensorFlow...")

interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

#load class names from saved json file during training
CLASS_PATH = os.path.join(BASE_DIR, "class_names.json")

with open(CLASS_PATH, "r") as f:
    class_names = json.load(f)


logger.info("Model loaded successfully.")

#routes

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': True
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    start_time = time.time()

    if 'image' not in request.files:
        return jsonify({'error': "No 'image' field in request"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': "Unsupported file extension"}), 400

    if not validate_image_file(file.stream):
        return jsonify({'error': "Invalid image file"}), 400

    saved_path = save_upload(file, app.config['UPLOAD_FOLDER'])

    #preprocess image

    img = cv2.imread(saved_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))

    img = img.astype(np.float32)
    img = np.expand_dims(img, axis=0)

    #inference

    interpreter.set_tensor(input_details[0]['index'], img)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])

    predicted_index = int(np.argmax(output))
    confidence = float(np.max(output))

    response = {
        'predicted_class': class_names[predicted_index],
        'confidence': round(confidence, 4),
        'processing_time_sec': round(time.time() - start_time, 3)
    }

    return jsonify(response), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
