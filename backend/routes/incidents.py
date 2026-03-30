from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

INCIDENTS_PATH = os.path.join(os.path.dirname(__file__), "../../mock/incident.json")
PREDICTIONS_PATH = os.path.join(os.path.dirname(__file__), "../../mock/prediction.json")

def read_json(path):
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

@router.get("/")
def get_incidents():
    return read_json(INCIDENTS_PATH)

@router.get("/{incident_id}")
def get_incident(incident_id: str):
    incidents = read_json(INCIDENTS_PATH)
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, body: dict):
    incidents = read_json(INCIDENTS_PATH)
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident["status"] = body["status"]
    write_json(INCIDENTS_PATH, incidents)
    return incident

@router.delete("/{incident_id}")
def delete_incident(incident_id: str):
    incidents = read_json(INCIDENTS_PATH)
    incidents = [i for i in incidents if i["id"] != incident_id]
    write_json(INCIDENTS_PATH, incidents)
    return {"message": "Incident deleted"}