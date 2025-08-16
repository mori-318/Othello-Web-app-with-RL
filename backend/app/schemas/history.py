from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.match import OpponentType


class HistoryItem(BaseModel):
    """
    対戦履歴アイテム
    id: 対戦ID
    opponent: 対戦相手
    created_at: ISO8601文字列（UTC）
    finished_at: ISO8601文字列（UTC） | null
    winner: 勝者（1, -1, 0）| null
    score: 黒が+1, 白が-1の合計
    """
    id: str = Field(description="対戦ID")
    opponent: OpponentType = Field(description="対戦相手の種類")
    created_at: str = Field(description="開始時刻(ISO8601 UTC)")
    finished_at: Optional[str] = Field(default=None, description="終了時刻(ISO8601 UTC)")
    winner: Optional[int] = Field(default=None, description="勝者 1|-1|0|null")
    score: int = Field(description="スコア: 黒が+、白が-")
