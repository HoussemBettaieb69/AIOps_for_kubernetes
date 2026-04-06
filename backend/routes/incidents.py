from fastapi import APIRouter, HTTPException
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.db_services import get_collection

router = APIRouter()

def fix_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
def get_incidents():
    col = get_collection("incident")
    return [fix_id(i) for i in col.find()]

@router.get("/{incident_id}")
def get_incident(incident_id: str):
    col = get_collection("incident")
    incident = col.find_one({"id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return fix_id(incident)

@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, body: dict):
    col = get_collection("incident")
    result = col.update_one({"id": incident_id}, {"$set": {"status": body["status"]}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    return fix_id(col.find_one({"id": incident_id}))

@router.delete("/{incident_id}")
def delete_incident(incident_id: str):
    col = get_collection("incident")
    col.delete_one({"id": incident_id})
    return {"message": "Incident deleted"}