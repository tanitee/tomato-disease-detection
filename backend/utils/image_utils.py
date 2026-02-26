import os
import uuid
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

def validate_upload(files):
    if 'image' not in files:
        return None, "No 'image' field in request"

    file = files['image']

    if file.filename == '':
        return None, "Empty filename"

    if not allowed_file(file.filename):
        return None, "Unsupported file extension"

    if not validate_image_file(file.stream):
        return None, "Invalid image file"

    return file, None

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
    except:
        stream.seek(0)
        return False

def save_upload(file, upload_folder: str) -> str:
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    os.makedirs(upload_folder, exist_ok=True)
    save_path = os.path.join(upload_folder, unique_name)

    file.save(save_path)
    return save_path
