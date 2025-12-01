# vision.py

import cv2
from typing import List, Tuple, Dict
from multi_model_detection import detect_best_conf


def load_image_from_path(path: str):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image from {path}")
    return img


def predict_food_items(image) -> Tuple[List[str], Dict[str, float], Dict[str, List[float]]]:
    """
    Wrapper around multi_model_detection for CLI or debugging.
    """
    return detect_best_conf(image)
