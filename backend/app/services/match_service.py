import uuid
from typing import Dict

from app.domain.othello.othello import Othello

class Match:
    """
    対戦を表す
    """
    def __init__(self, opponent: str):
        """
        Args:
            opponent (str): 対戦相手(random|agent_v1|pvp)
        """
        self.id = str(uuid.uuid4())
        self.game = Othello()
        self.opponent = opponent

class MatchService:
    """
    対戦を管理するサービス
    """
    def __init__(self) -> None:
        self._store: Dict[str, Match] = {}

    def create_match(self, opponent: str) -> Match:
        """
        対戦を開始する
        Args:
            opponent (str): 対戦相手(random|agent_v1|pvp)
        Returns:
            Match: 対戦
        """
        m = Match(opponent)
        self._store[m.id] = m
        return m

    def get(self, match_id: str) -> Match:
        """
        対戦を取得する
        Args:
            match_id (str): 対戦ID
        Raises:
            ValueError: 対戦IDが存在しない場合
        Returns:
            Match: 対戦
        """
        if match_id not in self._store:
            raise ValueError("Match not found")
        return self._store[match_id]

    def move(self, match_id: str, row: int, col: int) -> Match:
        m = self.get(match_id)
        m.game.play(row, col)
        return m

service = MatchService()