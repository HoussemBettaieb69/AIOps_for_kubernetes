from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.incidents import router as incidents_router
from routes.predictions import router as predictions_router
from routes.metrics import router as metrics_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(incidents_router, prefix="/incidents")
app.include_router(predictions_router, prefix="/predictions")
app.include_router(metrics_router, prefix="/metrics")