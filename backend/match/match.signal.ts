const matchSignal: nkruntime.MatchSignalFunction<any> = (
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  data
) => {

  const message = data;

  logger.info("Signal received:", message);

  if (message === "reset") {
    state.board = Array(9).fill(null);
    state.turn = "X";
    state.winner = null;

    logger.info("Game reset");
  }

  return {
    state,
    data
  };
};