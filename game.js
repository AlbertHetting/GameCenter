// src/lib/game.js
import { db } from "/firebaseClient";
import { ref, runTransaction, serverTimestamp } from "firebase/database";
import WordCardData from "../data/WordCardData.json";
import MethodData from "../data/MethodData.json";

// Fisher-Yates
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nowMs() {
  return Date.now();
}

/** Transaction: start a pick phase (choose performer + 3 cards + 1 method) */
export async function startPickPhase(code) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;

    // Build list of players
    const players = room.players || {};
    const uids = Object.keys(players);
    if (uids.length === 0) return room;

    // Decide next performer: the one with the fewest "performed" count (tie-break by uid)
    let min = Infinity, candidate = null;
    for (const uid of uids) {
      const p = players[uid] || {};
      const perf = Number.isInteger(p.performed) ? p.performed : 0;
      if (perf < min || (perf === min && uid < candidate)) {
        min = perf;
        candidate = uid;
      }
    }

    // Prepare prompt options
    const cardIndexes = shuffle([...Array(WordCardData.length).keys()]).slice(0, 3);
    const methodIndex = (Math.random() * MethodData.length) | 0;

    // 20s pick window
    const pickMs = 20 * 1000;
    const pickEndsAt = nowMs() + pickMs;

    return {
      ...room,
      phase: "pick",
      performerUid: candidate,
      prompt: {
        cards: cardIndexes,
        methodIndex,
        choice: null
      },
      timers: { ...(room.timers || {}), pickEndsAt },
      // round increases only when previous was round_end or null
      round: room.round ? room.round : 1
    };
  });
}

/** Transaction: performer locks their choice and starts the guess phase (90s) */
export async function startGuessPhase(code, cardIndex, methodIndex) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;
    const roundMs = 90 * 1000;
    const roundEndsAt = nowMs() + roundMs;

    return {
      ...room,
      phase: "guess",
      prompt: {
        ...(room.prompt || {}),
        choice: { cardIndex, methodIndex }
      },
      timers: { ...(room.timers || {}), roundEndsAt },
      winner: null
    };
  });
}

/** Transaction: set winner once (first-come wins). Also grant point. */
export async function trySetWinnerAndScore(code, uid, name) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.winner) return room; // already decided

    const players = room.players || {};
    const p = players[uid] || {};
    const score = Number.isInteger(p.score) ? p.score : 0;

    return {
      ...room,
      winner: { uid, name, guessAt: nowMs() },
      players: {
        ...players,
        [uid]: { ...p, score: score + 1 }
      },
      phase: "round_end"
    };
  });
}

/** Transaction: advance to next round or game end */
export async function advanceOrEnd(code) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;

    // Mark current performer as "performed +1"
    const perfUid = room.performerUid;
    const players = { ...(room.players || {}) };
    if (perfUid && players[perfUid]) {
      const current = Number.isInteger(players[perfUid].performed) ? players[perfUid].performed : 0;
      players[perfUid] = { ...players[perfUid], performed: current + 1 };
    }

    // Check if EVERYONE has performed twice
    const allDone = Object.values(players).length > 0 &&
      Object.values(players).every(p => (Number.isInteger(p.performed) ? p.performed : 0) >= 2);

    if (allDone) {
      return {
        ...room,
        players,
        phase: "game_end"
      };
    }

    // Otherwise, bump round number and go back to pick with a new performer
    return {
      ...room,
      players,
      winner: null,
      round: (room.round || 1) + 1,
      performerUid: null, // will be set on startPickPhase
      phase: "pick_prep"  // transient; clients will call startPickPhase next
    };
  });
}
