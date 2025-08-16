from abc import ABC, abstractmethod
from typing import List, Tuple
from app.domain.othello.othello import Othello


class AgentPolicy(ABC):
    """エージェントのポリシーインターフェース"""
    
    @abstractmethod
    def select_move(self, game: Othello) -> Tuple[int, int]:
        """
        現在のゲーム状態から次の手を選択する
        
        Args:
            game (Othello): 現在のゲーム状態
            
        Returns:
            Tuple[int, int]: 選択された手の座標 (row, col)
            
        Raises:
            ValueError: 合法手がない場合
        """
        pass
