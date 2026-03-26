const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction<any> = (
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  presence,
  metadata
) => {

  logger.info("match join attempt called");

  const alreadyExists = state.players.find(
    (p: any) => p.userId === presence.userId
  );

  if (alreadyExists) {
    logger.info("Rejecting duplicate join: " + presence.userId);

    return {
      state,
      accept: false,
      rejectMessage: "You are already in this match"
    };
  }

  if (state.players.length >= 2) {
    logger.info("Match full, rejecting:", presence.userId);

    return {
      state,
      accept: false,
      rejectMessage: "Match is full"
    };
  }

  logger.info("Player allowed:", presence.userId);

  return {
    state,
    accept: true
  };
};