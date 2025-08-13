import sys
from pathlib import Path

# backend を sys.path 先頭に追加
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))