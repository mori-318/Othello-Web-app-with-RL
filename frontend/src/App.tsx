import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import History from "./pages/History";

function App() {
    return (
        <BrowserRouter>
            <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
                <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <h1 style={{ margin: 0 }}>Othello</h1>
                    <nav style={{ display: "flex", gap: 12 }}>
                        <Link to="/">Home</Link>
                        <Link to="/history">History</Link>
                    </nav>
                </header>
                <main style={{ marginTop: 16 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/game" element={<Game />} />
                        <Route path="/history" element={<History />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App
