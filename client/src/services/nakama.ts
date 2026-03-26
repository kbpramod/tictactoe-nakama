import { Client, type Socket, Session } from "@heroiclabs/nakama-js";

const client = new Client(
  "defaultkey",
  "192.168.1.14",
  "7350",
  false
);

let socket: Socket | null = null;
let session: Session;
let connectingPromise: Promise<Socket> | null = null;

export async function connect(): Promise<Socket> {
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      const deviceId =
        localStorage.getItem("deviceId") ||
        Math.random().toString(36).substring(2);

      localStorage.setItem("deviceId", deviceId);

      session = await client.authenticateDevice(deviceId);

      socket = client.createSocket();

      await socket.connect(session, true);

      console.log("✅ Connected to Nakama");

      return socket;
    } catch (err) {
      console.error("❌ Nakama connection failed", err);
      socket = null;
      session;
      throw err;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}



export async function getSocket(): Promise<Socket> {
  if (socket) return socket;

  console.warn("⚠️ Socket not found, reconnecting...");
  return await connect();
}


export function getSession() {
  return session;
}

export { client };