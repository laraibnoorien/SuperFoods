# vision.py

import io, base64
from PIL import Image, ImageDraw


def annotate(image, boxes, confs):
    img = image.convert("RGB")
    draw = ImageDraw.Draw(img)

    for label, bbox in boxes.items():
        x1, y1, x2, y2 = bbox
        color = "lime"
        conf_text = f"{label} {confs[label]*100:.1f}%"
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
        draw.text((x1, max(0, y1 - 14)), conf_text, fill=color)

    return img


def encode_base64(img):
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode()
