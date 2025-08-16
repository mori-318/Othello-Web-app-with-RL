import uuid
from typing import Dict, List, Optional, TypedDict
from datetime import datetime, timezone

from app.domain.othello.othello import Othello, WHITE
from app.agents.random_policy import RandomPolicy
from app.agents.rl_policy import RLPolicy

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
        self.created_at: datetime = datetime.now(timezone.utc)
        self.finished_at: Optional[datetime] = None

class HistoryItem(TypedDict):
    id: str
    opponent: str
    created_at: str
    finished_at: Optional[str]
    winner: Optional[int]
    score: int

class MatchService:
    """
    対戦を管理するサービス
    """
    def __init__(self) -> None:
        self._store: Dict[str, Match] = {}
        self._history: List[HistoryItem] = []

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
        """
        手を打つ（プレイヤーの手 + エージェントの手）
        Args:
            match_id (str): 対戦ID
            row (int): 行
            col (int): 列
        Returns:
            Match: 更新された対戦
        """
        m = self.get(match_id)
        
        # プレイヤーの手を実行
        m.game.play(row, col)
        
        # プレイヤーの着手後、AIの手番である間はAIが連続して指す（パス処理含む）
        while not m.game.terminal() and m.opponent in ["random", "agent"] and self._is_agent_turn(m):
            moved = self._make_agent_move(m)
            if not moved:
                break
        
        # 対戦終了時に履歴へ記録（重複登録防止）
        if m.game.terminal() and m.finished_at is None:
            m.finished_at = datetime.now(timezone.utc)
            item: HistoryItem = {
                "id": m.id,
                "opponent": m.opponent,
                "created_at": m.created_at.isoformat(),
                "finished_at": m.finished_at.isoformat() if m.finished_at else None,
                "winner": m.game.winner(),
                "score": m.game.score(),
            }
            self._history.append(item)

        return m
    
    def _make_agent_move(self, match: Match) -> bool:
        """
        エージェントの手を実行する
        Args:
            match (Match): 対戦
        """
        try:
            if match.opponent == "random":
                policy = RandomPolicy()
            elif match.opponent == "agent":
                policy = RLPolicy()
            else:
                return False  # pvpの場合は何もしない

            # 念のためAIの手番か確認（人間=黒, AI=白 前提）
            if not self._is_agent_turn(match):
                return False

            legal = match.game.legal_moves()
            if not legal:
                return False

            agent_row, agent_col = policy.select_move(match.game)
            match.game.play(agent_row, agent_col)
            return True
        except Exception:
            # エージェントの手の実行に失敗した場合は何もしない
            return False

    def _is_agent_turn(self, match: Match) -> bool:
        """AIの手番かどうか（人間=黒, AI=白 前提）"""
        return match.game.player == WHITE

    def history(self) -> List[HistoryItem]:
        """履歴一覧（新しい順）"""
        return list(reversed(self._history))

service = MatchService()