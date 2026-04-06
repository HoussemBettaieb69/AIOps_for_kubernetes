from fastapi import APIRouter, HTTPException
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.db_services import get_collection

router = APIRouter()

def fix_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
def get_predictions():
    col = get_collection("prediction")
    return [fix_id(p) for p in col.find()]

@router.get("/{prediction_id}")
def get_prediction(prediction_id: str):
    col = get_collection("prediction")
    prediction = col.find_one({"id": prediction_id})
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return fix_id(prediction)

@router.patch("/{prediction_id}/status")
def update_prediction_status(prediction_id: str, body: dict):
    col = get_collection("prediction")
    result = col.update_one({"id": prediction_id}, {"$set": {"status": body["status"]}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return fix_id(col.find_one({"id": prediction_id}))

@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: str):
    col = get_collection("prediction")
    col.delete_one({"id": prediction_id})
    return {"message": "Prediction deleted"}