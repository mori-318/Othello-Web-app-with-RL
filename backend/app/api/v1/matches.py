from typing import List
from fastapi import APIRouter, HTTPException

from app.schemas.match import MatchCreate, MoveRequest, MatchState
from app.services.match_service import service, Match

router = APIRouter(tags=["matches"])

def _to_state(m: Match) -> MatchState:
    """
    対戦状態をMatchStateに変換する
    """
    game = m.game
    legal = game.legal_moves(game.player)
    # List[Tuple[int,int]] -> List[List[int]] に変換
    legal_ll: List[list[int]] = [[r, c] for r, c in legal]
    return MatchState(
        id=m.id,
        board=game.board,
        player=game.player,
        legal_moves=legal_ll,
        over=game.terminal(),
        score=game.score(),
        opponent=m.opponent,
        winner=(game.winner() if game.terminal() else None),
    )

@router.post("/matches", response_model=MatchState)
def create_match(payload: MatchCreate):
    """
    MatchCreateのopponentを元に対戦を開始する（_to_stateでMatchStateに変換して返す）
    Args:
        payload (MatchCreate): 対戦開始リクエスト
    Returns:
        MatchState: 対戦状態
    """
    m = service.create_match(payload.opponent)
    return _to_state(m)

@router.get("/matches/{match_id}", response_model=MatchState)
def get_match(match_id: str):
    """
    match_idを元に対戦状態を取得する（_to_stateでMatchStateに変換して返す）
    Args:
        match_id (str): 対戦ID
    Returns:
        MatchState: 対戦状態
    """
    try:
        m = service.get(match_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Match not found")
    return _to_state(m)

@router.post("/matches/{match_id}/move", response_model=MatchState)
def post_move(match_id: str, req: MoveRequest):
    """
    リクエストされた手を元に対戦状態を更新
    Args:
        match_id (str): 対戦ID
        req (MoveRequest): 手のリクエスト
    Returns:
        MatchState: 対戦状態
    """
    try:
        m = service.move(match_id, req.row, req.col)
    except KeyError:
        raise HTTPException(status_code=404, detail="Match not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _to_state(m)