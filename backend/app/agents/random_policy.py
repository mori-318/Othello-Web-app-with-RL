import random
from typing import Tuple
from app.domain.othello.othello import Othello
from .agent_policy import AgentPolicy


class RandomPolicy(AgentPolicy):
    """ランダムに合法手を選択するポリシー"""
    
    def select_move(self, game: Othello) -> Tuple[int, int]:
        """
        合法手からランダムに一つを選択する
        
        Args:
            game (Othello): 現在のゲーム状態
            
        Returns:
            Tuple[int, int]: 選択された手の座標 (row, col)
            
        Raises:
            ValueError: 合法手がない場合
        """
        legal_moves = game.legal_moves()
        
        if not legal_moves:
            raise ValueError("合法手がありません")
        
        return random.choice(legal_moves)
