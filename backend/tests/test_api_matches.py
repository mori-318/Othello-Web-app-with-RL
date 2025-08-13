from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_match_and_get():
    r = client.post("/api/v1/matches", json={"opponent": "random"})
    assert r.status_code == 200
    data = r.json()
    match_id = data["id"]
    assert isinstance(match_id, str)
    assert data["player"] in (1, -1)

    r2 = client.get(f"/api/v1/matches/{match_id}")
    assert r2.status_code == 200
    data2 = r2.json()
    assert data2["id"] == match_id

def test_move_flow_and_illegal():
    r = client.post("/api/v1/matches", json={"opponent": "random"})
    match_id = r.json()["id"]

    # 合法手のどれかを打つ
    state = r.json()
    legal_moves = state["legal_moves"]
    row, col = legal_moves[0]

    r2 = client.post(f"/api/v1/matches/{match_id}/move", json={"row": row, "col": col})
    assert r2.status_code == 200

    # 明らかに不正な手を打つ（角）
    r3 = client.post(f"/api/v1/matches/{match_id}/move", json={"row": 0, "col": 0})
    assert r3.status_code == 400