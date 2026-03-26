import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { client, getSocket, getSession } from "../services/nakama";
import type { Session, Socket } from "@heroiclabs/nakama-js";

export default function Home() {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const init = async () => {
    const socket = await getSocket();
    const session = getSession();

    socketRef.current = socket;
    sessionRef.current = session;

    console.log("✅ initialized socket + session");
  };

  useEffect(() => {
    init();
  }, []);

  // 🔥 CREATE MATCH
  const handleCreate = async () => {
    try {
      if (!socketRef.current || !sessionRef.current) {
        throw new Error("Socket not initialized");
      }

      setLoading(true);

      const res = await client.rpc(
        sessionRef.current,
        "create_tictactoe_match",
        {}
      );

      const matchId =
        typeof res.payload === "string"
          ? JSON.parse(res.payload).matchId
          : (res.payload as any).matchId;

      console.log("✅ matchId:", matchId);

      await socketRef.current.joinMatch(matchId);

      navigate(`/game/${matchId}`);
    } catch (err) {
      console.error("Create match failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 JOIN MATCH
  const handleJoin = async () => {
    if (!matchIdInput.trim()) return;

    try {
      if (!socketRef.current) {
        throw new Error("Socket not initialized");
      }

      setLoading(true);

      await socketRef.current.joinMatch(matchIdInput);

      console.log("✅ joined match:", matchIdInput);

      navigate(`/game/${matchIdInput}`);
    } catch (err) {
      console.error("Join match failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Tic Tac Toe 🎮</h1>

      <div className="card">
        <button onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Match"}
        </button>

        <div className="join-section">
          <input
            type="text"
            placeholder="Enter Match ID"
            value={matchIdInput}
            onChange={(e) => setMatchIdInput(e.target.value)}
          />
          <button onClick={handleJoin} disabled={loading}>
            Join Match
          </button>
        </div>
      </div>
    </div>
  );
}