import React from "react";
import { useNavigate } from "react-router-dom";
import type { OpponentType } from "../api/client";

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleStartGame = (opponent: OpponentType) => {
        navigate("/game", { state: { opponent } });
    };

    return (
        <div style={{ 
            maxWidth: "600px", 
            margin: "0 auto", 
            padding: "2rem",
            textAlign: "center"
        }}>
            <h1 style={{ 
                fontSize: "2.5rem", 
                marginBottom: "2rem",
                color: "#1f2937"
            }}>
                オセロゲーム
            </h1>
            
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "1rem",
                marginBottom: "2rem"
            }}>
                <button
                    onClick={() => handleStartGame("random")}
                    style={{
                        padding: "1rem 2rem",
                        fontSize: "1.2rem",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                >
                    ランダムAIと対戦
                </button>
                
                <button
                    onClick={() => handleStartGame("agent")}
                    style={{
                        padding: "1rem 2rem",
                        fontSize: "1.2rem",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                >
                    RLエージェントと対戦
                </button>
                
                <button
                    onClick={() => handleStartGame("pvp")}
                    style={{
                        padding: "1rem 2rem",
                        fontSize: "1.2rem",
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d97706"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f59e0b"}
                >
                    2人対戦（ホットシート）
                </button>
            </div>
            
            <button
                onClick={() => navigate("/history")}
                style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4b5563"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6b7280"}
            >
                対戦履歴を見る
            </button>
        </div>
    );
};

export default Home;