import type { Socket } from "@heroiclabs/nakama-js";
import { connect } from "./nakama";

let socket: Socket;

async function init() {
  socket = await connect();
}

export async function joinMatch(matchId: string) {
  return await socket.joinMatch(matchId);
}

export function sendMove(matchId: string, index: number) {
  socket.sendMatchState(matchId, 1, JSON.stringify({ index }));
}

export async function createMatch() {
  const res = await socket.createMatch("tic-tac-toe");
  return res.match_id;
}

init();