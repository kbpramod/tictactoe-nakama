import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBoard from "../components/GameBoard";
import ResultModal from "../components/ResultModal";
import { getSocket, getSession } from "../services/nakama";
import "../App.css";

export default function Game() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef<any>(null);

  const [state, setState] = useState<any>(null);
  const [status, setStatus] = useState("joining");
  const [result, setResult] = useState<"win" | "lose" | "opponent_left" | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!matchId) return;

      try {
        const socket = await getSocket();
        socketRef.current = socket;

        console.log("✅ socket connected");

        await socket.joinMatch(matchId);

        console.log("✅ joined match:", matchId);

        setStatus("waiting");

        socket.sendMatchState(
          matchId,
          0,
          JSON.stringify({})
        );

        socket.onmatchdata = (matchData: any) => {
          if (matchData.match_id !== matchId) return;

          const jsonStr = new TextDecoder().decode(matchData.data);
          const data = JSON.parse(jsonStr);

          console.log("📦 state:", data);

          if (!isMounted) return;

          setState(data);

          if (data.players?.length === 2 && !data.winner) {
            setStatus("playing");
          }

          if (data.winner) {
            setStatus("finished");

            if (data.winner === "no_players") {
              setResult("opponent_left");
              return;
            }

            const me = data.players.find(
              (p: any) => p.userId === myUserId
            );

            if (me?.symbol === data.winner) {
              setResult("win");
            } else {
              setResult("lose");
            }
          }
        };
      } catch (err) {
        console.error("Failed to join match", err);
        navigate("/")
      }
    }

    init();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.onmatchdata = null;
      }
    };
  }, [matchId]);

  const session = getSession();
  const myUserId = session?.user_id;

  const me = state?.players?.find((p: any) => p.userId === myUserId);
  const mySymbol = me?.symbol;

  const isMyTurn = state && mySymbol === state.turn;

  const handleClick = (index: number) => {
    if (!state || state.winner) return;
    if (!isMyTurn) return;

    socketRef.current.sendMatchState(
      matchId,
      1,
      JSON.stringify({ index })
    );
  };

  const leaveGame = async() => {
    try {
    if (socketRef.current && matchId) {
      await socketRef.current.leaveMatch(matchId);
      console.log("🚪 Left match");
    }
  } catch (err) {
    console.error("Leave failed", err);
  } finally {
    navigate("/");
  }
  };

  if (!matchId) {
    return <h2 className="game">Invalid Match</h2>;
  }

  return (
    <div className="game">
      <h2>Match ID: {matchId}</h2>

      {status === "joining" && <h3>Joining match...</h3>}
      {status === "waiting" && <h3>Waiting for opponent...</h3>}

      {state && (
        <>
          <h3>Your Symbol: {mySymbol || "-"}</h3>

          {!state.winner && (
            <h3>
              {isMyTurn ? "Your Move" : "Opponent's Move"} (
              {state.turn})
            </h3>
          )}

          <GameBoard
            board={state.board}
            onClick={handleClick}
          />

          {state.winner && (
            <h2 className="winner">
              Winner: {state.winner}
            </h2>
          )}

          <button className="leave-btn" onClick={leaveGame}>
            Leave Game
          </button>

          <ResultModal result={result}/>
        </>

        
      )}
    </div>
  );
}