# multi_model_detection.py

from ultralytics import YOLO
from typing import List, Tuple, Dict
from config import WESTERN_MODEL_PATH, INDIAN_MODEL_PATH

western_model = YOLO(WESTERN_MODEL_PATH)
indian_model = YOLO(INDIAN_MODEL_PATH)


def _clean_label(lbl: str) -> str:
    return lbl.lower().strip().replace("_", " ")


def _run_model(model, image) -> List[Tuple[str, float, list]]:
    try:
        results = model.predict(image, conf=0.40, verbose=False)
    except:
        import cv2
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = model.predict(rgb, conf=0.40, verbose=False)

    detections = []

    for r in results:
        if not r.boxes:
            continue
        for box in r.boxes:
            cls = int(box.cls)
            conf = float(box.conf)
            label = _clean_label(model.names.get(cls, "unknown"))
            xyxy = box.xyxy.tolist()[0]
            detections.append((label, conf, xyxy))
    return detections


def detect_best_conf(image, model_type="auto"):
    if model_type == "indian":
        det = _run_model(indian_model, image)
    elif model_type == "western":
        det = _run_model(western_model, image)
    else:
        det = _run_model(indian_model, image) + _run_model(western_model, image)

    best = {}
    for label, conf, bbox in det:
        if label not in best or conf > best[label][0]:
            best[label] = (conf, bbox)

    labels = list(best.keys())
    confs = {lbl: v[0] for lbl, v in best.items()}
    boxes = {lbl: v[1] for lbl, v in best.items()}
    return labels, confs, boxes
