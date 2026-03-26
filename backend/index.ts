const moduleName = "tic-tac-toe";

const createTicTacToeMatch = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: any
) {
  const matches = nk.matchList(
    10,
    true,
    "tic-tac-toe",
    null,
    1
  );

  let matchId;

  if (matches.length > 0) {
    matchId = matches[0].matchId;
    logger.info("Joining existing match: " + matchId);
  } else {
    matchId = nk.matchCreate("tic-tac-toe", {});
    logger.info("Created new match: " + matchId);
  }

  return JSON.stringify({ matchId });
};

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {

    initializer.registerMatch(moduleName, {
        matchInit,
        matchJoin,
        matchJoinAttempt,
        matchLeave,
        matchLoop,
        matchSignal,
        matchTerminate
    });

    initializer.registerRpc("create_tictactoe_match", createTicTacToeMatch);

    logger.info('Tic-tac-toe game JavaScript logic loaded.');
}