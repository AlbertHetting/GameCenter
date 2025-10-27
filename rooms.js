import { auth, db } from "/firebaseClient";
import { ref, get, set, child, serverTimestamp } from "firebase/database";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid 0/O/I/1
function randomCode(len = 8) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

export async function createRoom() {
  // try a few times to avoid rare collisions
  for (let i = 0; i < 5; i++) {
    const code = randomCode();
    const roomRef = ref(db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (snap.exists()) continue;

    const u = auth.currentUser;
    const host = u ? { uid: u.uid, name: u.displayName || "Player" } : null;

    await set(roomRef, {
      code,
      createdAt: serverTimestamp(),
      host,
      players: host ? { [host.uid]: host.name } : {},
      state: "lobby"
    });
    return code;
  }
  throw new Error("Could not generate unique room code");
}

export async function joinRoom(code) {
  const u = auth.currentUser;
  if (!u) throw new Error("Must be signed in");
  const name = u.displayName || "Player";

  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room not found");

  await set(child(roomRef, `players/${u.uid}`), name);
}


