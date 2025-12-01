# multi_model_detection.py

from ultralytics import YOLO
from typing import List, Tuple, Dict, Any
from config import WESTERN_MODEL_PATH, INDIAN_MODEL_PATH

# Load models once
western_model = YOLO(WESTERN_MODEL_PATH)
indian_model = YOLO(INDIAN_MODEL_PATH)

indianmapper={
  0: "roti",
  1: "rasgulla",
  2: "biryani",
  3: "uttapam",
  4: "palak paneer",
  5: "poha",
  6: "khichdi",
  7: "omelette",
  8: "rice",
  9: "dalmakhani",
  10: "rajma",
  11: "poori",
  12: "chole",
  13: "dal",
  14: "sambar",
  15: "papad",
  16: "gulabjamun",
  17: "idli",
  18: "vada",
  19: "dosa"
}

def run_model(model, image) -> List[Tuple[str, float, list]]:
    """
    Run a single YOLO model.
    Returns list of (label, confidence, bbox[x1,y1,x2,y2])
    """
    results = model.predict(image, conf=0.40)
    detections: List[Tuple[str, float, list]] = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls)
            conf = float(box.conf)
            label = model.names.get(cls, "unknown")
            if model == indian_model:
                label = indianmapper.get(cls, "unknown")
            xyxy = box.xyxy.tolist()[0]  # [x1,y1,x2,y2]
            detections.append((label, conf, xyxy))

    return detections


def detect_best_conf(image) -> Tuple[List[str], Dict[str, float], Dict[str, list]]:
    """
    Run BOTH models and keep the highest-confidence detection per label.
    Returns:
        labels: list of unique labels
        confs: {label: confidence}
        boxes: {label: [x1,y1,x2,y2]}
    """

    west = run_model(western_model, image)
    ind = run_model(indian_model, image)

    best: Dict[str, Tuple[float, list]] = {}  # label -> (conf, bbox)

    for label, conf, bbox in west + ind:
        if label not in best or conf > best[label][0]:
            best[label] = (conf, bbox)

    labels = list(best.keys())
    confs = {lbl: v[0] for lbl, v in best.items()}
    boxes = {lbl: v[1] for lbl, v in best.items()}

    return labels, confs, boxes
