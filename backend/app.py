import os
import time
import json
import logging
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.image_utils import validate_upload, save_upload
from utils.preprocess import preprocess_image

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define paths, load model and class names
BASE_DIR = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'tomato_model.tflite')
LABELS_PATH = os.path.join(BASE_DIR, 'models', 'class_names.json')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

try:
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    model_loaded = True
    logger.info("TFLite model loaded successfully.")
except Exception as e:
    interpreter = None
    model_loaded = False
    logger.error("Model load failed: %s", e)

#load class names from json file saved during training
try:
    with open(LABELS_PATH, 'r') as f:
        class_names = json.load(f)
    logger.info("Class names loaded.")
except Exception as e:
    class_names = []
    logger.error("Failed to load class names: %s", e)


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model_loaded,
        'num_classes': len(class_names)
    }), 200

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    start_time = time.time()

    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 503

    file, error = validate_upload(request.files)
    if error:
        return jsonify({'error': error}), 400

    try:
        saved_path = save_upload(file, app.config['UPLOAD_FOLDER'])

        img_tensor = preprocess_image(saved_path)

        interpreter.set_tensor(input_details[0]['index'], img_tensor)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])

        probs = output[0]
        idx = int(np.argmax(probs))
        confidence = float(np.max(probs))

        disease = class_names[idx]

    except Exception as e:
        logger.error("Inference failed: %s", e)
        cleanup(saved_path)
        return jsonify({'error': 'Inference failed'}), 500

    cleanup(saved_path)

    total_time = round(time.time() - start_time, 3)

    return jsonify({
        'disease': disease,
        'confidence': round(confidence, 4),
        'confidence_pct': round(confidence * 100, 2),
        'latency_s': total_time
    }), 200

#cleanup function to remove uploaded files after processing to save disk space
def cleanup(path: str):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except:
        pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
