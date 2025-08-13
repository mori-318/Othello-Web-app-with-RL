import pytest

from app.domain.othello.othello import Othello, EMPTY, BLACK, WHITE

def count_pieces(board):
    """
    各色の石の数を返す
    Args:
        board (list[list[int]]): 盤面
    Returns:
        tuple[int, int, int]: (黒の石の数, 白の石の数, 空白の数)
    """
    black = sum(1 for r in range(8) for c in range(8) if board[r][c] == BLACK)
    white = sum(1 for r in range(8) for c in range(8) if board[r][c] == WHITE)
    empty = sum(1 for r in range(8) for c in range(8) if board[r][c] == EMPTY)
    return black, white, empty

def test_initial_setup():
    """
    初期盤面の石の配置を確認する
    """
    g = Othello()
    black, white, empty = count_pieces(g.board)
    assert black == 2        # 初期配置
    assert white == 2        # 初期配置
    assert empty == 60       # 初期配置
    assert g.player == BLACK # 初期配置

def test_illegal_move_raises():
    """
    初期局面で、(0, 0) は合法手ではない
    """
    g = Othello()
    with pytest.raises(ValueError):
        g.play(0, 0, BLACK)

def test_play_and_flip_one_direction():
    """
    初期局面で、(2, 3) に黒石を置くと、(3, 3) の白が反転
    """
    g = Othello()
    g.play(2, 3, BLACK)
    assert g.board[2][3] == BLACK
    assert g.board[3][3] == BLACK
    assert g.player == WHITE  # 手番が交代しているか

def test_score_consistency():
    """
    初期局面のスコアを確認する
    """
    g = Othello()
    s = g.score()
    black, white, _ = count_pieces(g.board)
    # 黒=1, 白=-1なので、score == 黒 - 白
    assert s == (black - white)

def test_terminal_and_winner_black_all():
    g = Othello()
    # 盤面を黒で埋める(テスト目的の直接操作)
    for r in range(8):
        for c in range(8):
            g.board[r][c] = BLACK
    assert g.terminal() is True
    assert g.winner() == BLACK