from fastapi import FastAPI
from app.api.v1.matches import router as matches_router

app = FastAPI(title="Othello API", version="0.1.0")

app.include_router(matches_router, prefix="/api/v1")