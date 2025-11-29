# vision.py

import cv2
from ultralytics import YOLO
from typing import List, Tuple
from config import YOLO_MODEL_PATH

# Load once, reuse
_model = YOLO(YOLO_MODEL_PATH)


def load_image_from_path(path: str):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image from {path}")
    return img


def capture_image_from_camera(camera_index: int = 0):
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Could not open camera")

    print("Camera open. Press 'q' to capture.")
    frame = None
    while True:
        ret, frame = cap.read()
        if not ret:
            raise RuntimeError("Failed to read from camera")
        cv2.imshow("Camera - press q to capture", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    return frame


def predict_food_items(image) -> Tuple[List[str], any]:
    """
    Run YOLO on the image.
    Returns:
        (list_of_food_labels, results_object)
    """
    results = _model.predict(image, conf=0.4)
    labels = []

    for r in results:
        for b in r.boxes:
            cls_idx = int(b.cls)
            label = _model.names[cls_idx]
            labels.append(label)

    return labels, results
