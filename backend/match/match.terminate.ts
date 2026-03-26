const matchTerminate: nkruntime.MatchTerminateFunction<any> = (
  ctx, logger, nk, dispatcher, tick, state, graceSeconds) => {
  return { state };
};