type Props = {
  board: (string | null)[];
  onClick: (index: number) => void;
};

export default function GameBoard({ board, onClick }: Props) {
  return (
    <div className="board">
      {board.map((cell, i) => (
        <div
          key={i}
          className="cell"
          onClick={() => onClick(i)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}