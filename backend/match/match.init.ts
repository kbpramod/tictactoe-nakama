let matchInit = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: any }
) => {
  logger.info("match initialisation")
  return {
    state: {
      board: Array(9).fill(null),
      players: [],
      turn: "X"
    },
    tickRate: 1,
    label: "tic-tac-toe"
  };
};