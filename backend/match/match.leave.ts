const matchLeave: nkruntime.MatchLeaveFunction<any> = (
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  presences
) => {

  presences.forEach((p) => {
    state.players = state.players.filter(
      (player: any) => player.userId !== p.userId
    );

    logger.info("Player left: " + p.userId);
  });

  if (state.players.length === 1 && !state.winner) {
    state.winner = state.players[0].symbol;

    dispatcher.broadcastMessage(1, JSON.stringify(state));

    state.shouldTerminate = true;
  }

  if (state.players.length === 0) {
    state.winner = "no_players";

    state.shouldTerminate = true;
  }

  return { state };
};