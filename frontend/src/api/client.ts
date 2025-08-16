/* API クライアント: backend の /api/v1 に合わせる */

export type OpponentType = "random" | "agent" | "pvp";

export type MatchState = {
    id: string;
    board: number[][];
    player: number; // 1: 黒, -1: 白
    legal_moves: number[][]; // [row, col][]
    over: boolean;
    score: number; // 黒が+、白が-
    opponent: OpponentType;
    winner: number | null; // 1 | -1 | 0 | null
};

export type HistoryItem = {
    id: string;
    opponent: OpponentType;
    created_at: string; // ISO8601 (UTC)
    finished_at: string | null; // ISO8601 (UTC) | null
    winner: number | null; // 1 | -1 | 0 | null
    score: number; // 黒が+、白が-
};

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const API = `${BASE}/api/v1`;

async function json<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}

export const api = {
    async createMatch(opponent: OpponentType): Promise<MatchState> {
        const res = await fetch(`${API}/matches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ opponent }),
        });
        return json<MatchState>(res);
    },

    async getMatch(matchId: string): Promise<MatchState> {
        const res = await fetch(`${API}/matches/${matchId}`);
        return json<MatchState>(res);
    },

    async postMove(matchId: string, row: number, col: number): Promise<MatchState> {
        const res = await fetch(`${API}/matches/${matchId}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ row, col }),
        });
        return json<MatchState>(res);
    },

    async getHistory(): Promise<HistoryItem[]> {
        const res = await fetch(`${API}/history`);
        return json<HistoryItem[]>(res);
    },
};
