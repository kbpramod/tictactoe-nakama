const matchJoin: nkruntime.MatchJoinFunction<any> = (
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  presences
) => {

  logger.info("presences", presences, "state", state)

  for (const p of presences) {
    const exists = state.players.find(
      (pl: any) => pl.userId === p.userId
    );

    if (exists) continue;
    if (state.players.length >= 2) break;

    state.players.push({
      userId: p.userId,
      symbol: state.players.length === 0 ? "X" : "O"
    });

    logger.info("Player joined: " + p.userId);
  }

  logger.info("Players now: " + JSON.stringify(state.players));

  
  dispatcher.broadcastMessage(
    1,
    JSON.stringify({
      board: state.board,
      players: state.players,
      turn: state.turn
    })
  );

  logger.info("Initial game state sent");

  return { state };
};