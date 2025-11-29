# analysis_pipeline.py

from typing import List, Dict, Any

from vision import predict_food_items
from llm_client import call_llm


def analyze_meal(image,
                 portion_size: float,
                 conditions: List[str]) -> Dict[str, Any]:
    """
    Full pipeline:
    1. YOLO detection -> food labels
    2. LLM -> nutrition + advice
    """

    food_labels, yolo_results = predict_food_items(image)

    if not food_labels:
        return {
            "error": "No food detected.",
            "yolo_labels": [],
        }

    llm_result = call_llm(food_labels, portion_size, conditions)

    # You can merge YOLO labels into the LLM result if needed.
    llm_result["yolo_labels"] = food_labels

    return llm_result
