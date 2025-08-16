import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Board } from "../components/Board";
import { api, type OpponentType, type MatchState } from "../api/client";

export const Game: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [matchState, setMatchState] = useState<MatchState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const opponent = (location.state as { opponent: OpponentType })?.opponent || "random";

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = async () => {
        try {
            setLoading(true);
            setError(null);
            const state = await api.createMatch(opponent);
            setMatchState(state);
        } catch (err) {
            setError(err instanceof Error ? err.message : "対戦開始に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = async (row: number, col: number) => {
        if (!matchState || matchState.over || loading) return;

        try {
            setLoading(true);
            setError(null);
            const newState = await api.postMove(matchState.id, row, col);
            setMatchState(newState);
        } catch (err) {
            setError(err instanceof Error ? err.message : "手の送信に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const getPlayerName = (player: number) => {
        return player === 1 ? "黒" : "白";
    };

    const getOpponentName = () => {
        switch (opponent) {
            case "random": return "ランダムAI";
            case "agent": return "RLエージェント";
            case "pvp": return "2人対戦";
            default: return "不明";
        }
    };

    if (loading && !matchState) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>対戦を開始しています...</p>
            </div>
        );
    }

    if (error && !matchState) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "#dc2626" }}>エラー: {error}</p>
                <button onClick={() => navigate("/")}>ホームに戻る</button>
            </div>
        );
    }

    if (!matchState) {
        return null;
    }

    return (
        <div style={{ 
            maxWidth: "800px", 
            margin: "0 auto", 
            padding: "1rem",
            textAlign: "center"
        }}>
            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "0.5rem 1rem",
                        marginRight: "1rem",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    ホームに戻る
                </button>
                <button
                    onClick={startNewGame}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                    disabled={loading}
                >
                    新しいゲーム
                </button>
            </div>

            <h2 style={{ marginBottom: "1rem" }}>
                {getOpponentName()}との対戦
            </h2>

            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1rem",
                padding: "0 2rem"
            }}>
                <div>
                    <strong>現在の手番: {getPlayerName(matchState.player)}</strong>
                </div>
                <div>
                    スコア - 黒: {Math.max(0, matchState.score)} | 白: {Math.max(0, -matchState.score)}
                </div>
            </div>

            {error && (
                <div style={{ 
                    color: "#dc2626", 
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    backgroundColor: "#fef2f2",
                    borderRadius: "4px"
                }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
                <Board
                    board={matchState.board}
                    legalMoves={matchState.legal_moves}
                    onCellClick={handleCellClick}
                />
            </div>

            {matchState.over && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 50,
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "8px",
                        minWidth: 320,
                        textAlign: "center",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}>
                        <h3 style={{ marginTop: 0 }}>ゲーム終了！</h3>
                        <p style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>
                            {matchState.winner === 0
                                ? "引き分け"
                                : `${getPlayerName(matchState.winner!)}の勝利`}
                        </p>
                        <p style={{ color: "#374151", margin: "0.25rem 0 1rem" }}>
                            最終スコア: 黒 {Math.max(0, matchState.score)} - {Math.max(0, -matchState.score)} 白
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                            <button
                                onClick={startNewGame}
                                style={{
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                新しいゲーム
                            </button>
                            <button
                                onClick={() => navigate("/history")}
                                style={{
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                履歴を見る
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ 
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div style={{ 
                        backgroundColor: "white",
                        padding: "1rem",
                        borderRadius: "8px"
                    }}>
                        処理中...
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;
