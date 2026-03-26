import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home.tsx";
import Game from "./pages/Game.tsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:matchId" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;