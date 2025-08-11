import random
import numpy as np
from typing import List, Tuple
from othello.othello import Othello

def generate_systematic_2tuples() -> List[Tuple[Tuple[int,int], ...]]:
    """8x8上の隣接ペアを系統的に列挙（横・縦・斜め）"""
    tuples = []
    # 横
    for r in range(8):
        for c in range(7):
            tuples.append(((r,c),(r,c+1)))
    # 縦
    for r in range(7):
        for c in range(8):
            tuples.append(((r,c),(r+1,c)))
    # 斜め（↘）
    for r in range(7):
        for c in range(7):
            tuples.append(((r,c),(r+1,c+1)))
    # 斜め（↙）
    for r in range(7):
        for c in range(1,8):
            tuples.append(((r,c),(r+1,c-1)))
    return tuples  # 合計: 56 + 56 + 49 + 49 = 210 本、各テーブルサイズ 3^2=9

class NTupleValue:
    """
    n-tuple ネットワーク（3進エンコード）
    - 盤面は「手番プレイヤー視点」で符号を反転せず評価
    - 各タプルは {自=2, 空=1, 相手=0} の3値をbase-3でインデックス化
    """
    __slots__ = ("tuples", "tables", "base_pow", "n_trits", "rng")

    def __init__(self, tuples: int = None, seed: int = 0):
        self.tuples = tuples if tuples is not None else generate_systematic_2tuples()
        self.tables = [0] * self.tuples
        self.base_pow = [1] * self.tuples
        self.n_trits = [0] * self.tuples
        self.rng = random.Random(seed)

    @staticmethod
    def _cell_trit(v: int, player: int) -> int:
        """セルの値を3進数に変換"""
        if v == player: return 2
        if v == 0: return 0
        return 1

    def indices_for(self, game: Othello, player: int) -> List[int]:
        """盤面を3進数に変換してインデックスを返す"""
        b = game.board
        idxs = []
        for t in self.tuples:
            s = 0
            for i, (r,c) in enumerate(t):
                s += self._cell_trit(b[r][c], player) * self.base_pow[i]
            idxs.append(s)
        return idxs

    def value_from_indices(self, idxs: List[int]) -> float:
        """インデックスから値を返す"""
        v = 0.0
        for tbl, idx in zip(self.tables, idxs):
            v += tbl[idx]
        return v

    def value(self, game: Othello, player: int) -> float:
        """盤面から価値を返す"""
        return self.value_from_indices(self.indices_for(game, player))

    def update(self, idxs: List[int], target: float, alpha: float):
        """価値を更新する"""
        v = self.value_from_indices(idxs)
        delta = target - v
        a = alpha * delta / len(self.tables)  # 均等配分で学習安定化
        for tbl, idx in zip(self.tables, idxs):
            tbl[idx] += a
        return delta

    def to_dict(self):
        """辞書形式で保存"""
        return {
            "tuples": self.tuples,
            "tables": [tbl.tolist() for tbl in self.tables]
        }
    @classmethod
    def from_dict(cls, d):
        """辞書形式で読み込み"""
        obj = cls(tuples=[tuple(map(tuple, t)) for t in d["tuples"]])
        obj.tables = [np.array(t, dtype=np.float64) for t in d["tables"]]
        return obj