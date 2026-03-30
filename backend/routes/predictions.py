from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

PREDICTIONS_PATH = os.path.join(os.path.dirname(__file__), "../../mock/prediction.json")

def read_json(path):
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

@router.get("/")
def get_predictions():
    return read_json(PREDICTIONS_PATH)

@router.get("/{prediction_id}")
def get_prediction(prediction_id: str):
    predictions = read_json(PREDICTIONS_PATH)
    prediction = next((p for p in predictions if p["id"] == prediction_id), None)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction

@router.patch("/{prediction_id}/status")
def update_prediction_status(prediction_id: str, body: dict):
    predictions = read_json(PREDICTIONS_PATH)
    prediction = next((p for p in predictions if p["id"] == prediction_id), None)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    prediction["status"] = body["status"]
    write_json(PREDICTIONS_PATH, predictions)
    return prediction

@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: str):
    predictions = read_json(PREDICTIONS_PATH)
    predictions = [p for p in predictions if p["id"] != prediction_id]
    write_json(PREDICTIONS_PATH, predictions)
    return {"message": "Prediction deleted"}