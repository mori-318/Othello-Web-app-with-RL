from typing import List
from fastapi import APIRouter

from app.schemas.history import HistoryItem
from app.services.match_service import service

router = APIRouter(tags=["history"])

@router.get("/history", response_model=List[HistoryItem])
def list_history() -> List[HistoryItem]:
    """対戦履歴一覧を新しい順で返す"""
    return service.history()
