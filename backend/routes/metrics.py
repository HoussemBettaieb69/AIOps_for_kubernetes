from fastapi import APIRouter
from services.metrics_services import get_latest_metrics # Assuming you'll name it this

router = APIRouter()

@router.get("/")
def read_metrics():
    return get_latest_metrics()