import cv2
import numpy as np

IMG_SIZE = (224, 224)

def preprocess_image(image_path: str) -> np.ndarray:
    img_bgr = cv2.imread(image_path)

    if img_bgr is None:
        raise ValueError("Failed to read image")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, IMG_SIZE)

    img_float = img_resized.astype(np.float32)

    img_batch = np.expand_dims(img_float, axis=0)

    return img_batch
