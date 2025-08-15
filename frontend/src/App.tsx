import { useState } from 'react'

// APIベースURLは, .env.development で定義されている
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// APIレスポンスの型
type MatchState = {
    id:          string
    board:       number[][]
    player:      number
    legal_moves: number[][]
    over:        boolean
    score:       {black: number, white: number}
    opponent:    string
    winner:      number | null
}

function App() {
    
    const [ready] = useState(true)
    return (
        <div style={{ padding: 16 }}>
            <h1>Othello Frontend</h1>
            <p>初期化完了。次のステップでAPI連携を実装します。</p>
            {ready && <small>Powered by Vite + React + TS</small>}
        </div>
    )
}

export default App
