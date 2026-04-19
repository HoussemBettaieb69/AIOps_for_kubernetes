from fastapi import APIRouter, Request
from services.logs_services import (
    get_latest_logs,
    insert_log,
    insert_batch_logs
)

router = APIRouter()

@router.get("/logs")
def fetch_logs():
    """
    Returns formatted logs for frontend/dashboard
    """
    return get_latest_logs()

@router.post("/logs/ingest")
async def ingest_logs(request: Request):
    data = await request.json()

    if isinstance(data, list):
        return insert_batch_logs(data)
    else:
        return insert_log(data)

@router.post("/logs/batch")
async def ingest_logs_batch(request: Request):
    """
    Receives multiple logs from Fluent Bit (json_lines mode)
    """
    logs_data = await request.json()
    return insert_batch_logs(logs_data)