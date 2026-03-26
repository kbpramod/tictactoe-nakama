const matchLoop: nkruntime.MatchLoopFunction<any> = (
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  messages
) => {

  messages.forEach((msg) => {

    let data: any;

    if (msg.opCode === 0) {
      logger.info("State requested by: " + msg.sender.userId);

      dispatcher.broadcastMessage(
        1,
        JSON.stringify(state),
        [msg.sender]
      );

      return;
    }

    try {
      data = JSON.parse(nk.binaryToString(msg.data));
    } catch (e) {
      logger.warn("Invalid message format");
      return;
    }

    logger.info("Data: " + JSON.stringify(data));

    const index = data.index;

    logger.info("Index: " + index);


    if (index < 0 || index > 8) {
      logger.warn("Invalid index:", index);
      return;
    }

    if (state.winner) {
      logger.info("Game already finished");
      return;
    }

    if (state.board[index] !== null) {
      logger.warn("Cell already occupied:", index);
      return;
    }

    const player = state.players.find(
      (p: any) => p.userId === msg.sender.userId
    );

    if (!player) {
      logger.warn("Unknown player");
      return;
    }

    if (player.symbol !== state.turn) {
      logger.warn("Not player's turn");
      return;
    }

    state.board[index] = player.symbol;

    logger.info(`Move applied: ${player.symbol} at ${index}`);

    const winner = checkWinner(state.board);

    if (winner) {
      state.winner = winner;
      logger.info("Winner:", winner);
    } else {
      state.turn = state.turn === "X" ? "O" : "X";
    }

    dispatcher.broadcastMessage(1, JSON.stringify(state));
  });

  if (state.shouldTerminate) {
    logger.info("Terminating match after broadcast");
    return null;
  }

  return { state };
};