import os
import uuid
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
logger = logging.getLogger(__name__)

def allowed_file(filename: str) -> bool:
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def validate_image_file(stream) -> bool:
    try:
        data = stream.read()
        stream.seek(0)
        Image.open(BytesIO(data)).verify()
        stream.seek(0)
        return True
    except Exception:
        try:
            stream.seek(0)
        except:
            pass
        return False

def save_upload(file, upload_folder: str) -> str:
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
    unique_name = f"{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
    os.makedirs(upload_folder, exist_ok=True)
    save_path = os.path.join(upload_folder, unique_name)
    file.save(save_path)
    logger.info("Saved upload to %s", save_path)
    return save_path
