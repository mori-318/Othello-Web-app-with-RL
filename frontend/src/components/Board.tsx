import React from "react";

export type BoardProps = {
    board: number[][]; // 8x8, 1: 黒, -1: 白, 0: 空
    legalMoves?: number[][]; // [row, col][]
    onCellClick?: (row: number, col: number) => void;
};

const cellSize = 48;

export const Board: React.FC<BoardProps> = ({ board, legalMoves = [], onCellClick }) => {
    const isLegal = (r: number, c: number) => legalMoves.some(([rr, cc]) => rr === r && cc === c);

    return (
        <div style={{ display: "inline-block", border: "2px solid #0d9488", background: "#065f46" }}>
            {board.map((row, rIdx) => (
                <div key={rIdx} style={{ display: "flex" }}>
                    {row.map((cell, cIdx) => {
                        const clickable = cell === 0 && isLegal(rIdx, cIdx) && !!onCellClick;
                        const bg = ((rIdx + cIdx) % 2 === 0) ? "#10b981" : "#059669";
                        return (
                            <button
                                key={cIdx}
                                onClick={() => clickable && onCellClick?.(rIdx, cIdx)}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: bg,
                                    border: "1px solid rgba(0,0,0,0.2)",
                                    cursor: clickable ? "pointer" : "default",
                                    position: "relative",
                                    padding: 0,
                                }}
                                aria-label={`r${rIdx}c${cIdx}`}
                            >
                                {cell !== 0 && (
                                    <div
                                        style={{
                                            width: cellSize - 14,
                                            height: cellSize - 14,
                                            borderRadius: "50%",
                                            background: cell === 1 ? "#111827" : "#e5e7eb",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                                        }}
                                    />
                                )}
                                {cell === 0 && isLegal(rIdx, cIdx) && (
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            background: "#f97316", // オレンジ
                                            boxShadow: "0 0 0 2px rgba(0,0,0,0.15)", // 外枠で視認性アップ
                                            position: "absolute",
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;
