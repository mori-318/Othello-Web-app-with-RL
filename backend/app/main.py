from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.matches import router as matches_router
from app.api.v1.history import router as history_router

app = FastAPI(title="Othello API", version="0.1.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")