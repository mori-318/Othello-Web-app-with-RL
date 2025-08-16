import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, type HistoryItem } from "../api/client";

export const History: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const historyData = await api.getHistory();
            setHistory(historyData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "履歴の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("ja-JP");
    };

    const getOpponentName = (opponent: string) => {
        switch (opponent) {
            case "random": return "ランダムAI";
            case "agent": return "RLエージェント";
            case "pvp": return "2人対戦";
            default: return opponent;
        }
    };

    const getResultText = (winner: number | null, score: number) => {
        if (winner === null) return "進行中";
        if (winner === 0) return "引き分け";
        
        const blackScore = Math.max(0, score);
        const whiteScore = Math.max(0, -score);
        return winner === 1 
            ? `黒の勝利 (${blackScore}-${whiteScore})`
            : `白の勝利 (${whiteScore}-${blackScore})`;
    };

    return (
        <div style={{ 
            maxWidth: "800px", 
            margin: "0 auto", 
            padding: "1rem"
        }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "2rem"
            }}>
                <h1>対戦履歴</h1>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    ホームに戻る
                </button>
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p>履歴を読み込み中...</p>
                </div>
            )}

            {error && (
                <div style={{ 
                    color: "#dc2626", 
                    padding: "1rem",
                    backgroundColor: "#fef2f2",
                    borderRadius: "4px",
                    marginBottom: "1rem"
                }}>
                    エラー: {error}
                </div>
            )}

            {!loading && !error && history.length === 0 && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "3rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px"
                }}>
                    <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
                        まだ対戦履歴がありません
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        ゲームを始める
                    </button>
                </div>
            )}

            {history.length > 0 && (
                <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <table style={{ 
                        width: "100%",
                        borderCollapse: "collapse"
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                <th style={{ 
                                    padding: "1rem",
                                    textAlign: "left",
                                    borderBottom: "1px solid #e5e7eb"
                                }}>
                                    対戦相手
                                </th>
                                <th style={{ 
                                    padding: "1rem",
                                    textAlign: "left",
                                    borderBottom: "1px solid #e5e7eb"
                                }}>
                                    開始日時
                                </th>
                                <th style={{ 
                                    padding: "1rem",
                                    textAlign: "left",
                                    borderBottom: "1px solid #e5e7eb"
                                }}>
                                    結果
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((match) => (
                                <tr key={match.id}>
                                    <td style={{ 
                                        padding: "1rem",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>
                                        {getOpponentName(match.opponent)}
                                    </td>
                                    <td style={{ 
                                        padding: "1rem",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>
                                        {formatDate(match.created_at)}
                                    </td>
                                    <td style={{ 
                                        padding: "1rem",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>
                                        {getResultText(match.winner, match.score)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
