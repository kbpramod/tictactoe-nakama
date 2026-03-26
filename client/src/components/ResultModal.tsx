import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type ResultType = "win" | "lose" | "opponent_left" | null;

interface Props {
  result: ResultType;
  onClose?: () => void;
}

export default function ResultModal({ result }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  if (!result) return null;

  const getMessage = () => {
    switch (result) {
      case "win":
        return "You Won!";
      case "lose":
        return "You Lost";
      case "opponent_left":
        return "Opponent Left — You Win!";
      default:
        return "";
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2>{getMessage()}</h2>

        <button
          onClick={() => {
            navigate("/");
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}