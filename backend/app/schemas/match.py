from typing import List, Literal, Optional
from pydantic import BaseModel, Field

OpponentType = Literal["random", "agent", "pvp"]

class MatchCreate(BaseModel):
    """
    対戦開始リクエスト
    opponent: 対戦相手の種類
    """
    opponent: OpponentType = Field(description="対戦相手の種類")

class MoveRequest(BaseModel):
    """
    row: int
    col: int
    """
    row: int
    col: int

class MatchState(BaseModel):
    """
    対戦状態
    id: 対戦ID
    board: 盤面
    player: 現在のプレイヤー
    legal_moves: 合法手
    over: 対戦終了
    score: 現在のスコア
    opponent: 対戦相手
    winner: 勝者
    """
    id: str
    board: List[List[int]]
    player: int
    legal_moves: List[List[int]]
    over: bool
    score: int
    opponent: OpponentType
    winner: Optional[int] = None
