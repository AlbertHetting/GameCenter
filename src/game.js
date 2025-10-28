// src/lib/game.js
import { db } from "/firebaseClient";
import { ref, runTransaction } from "firebase/database";
import WordCardData from "./data/WordCardData.json";
import MethodData   from "./data/MethodData.json";

// Fisher–Yates
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const nowMs = () => Date.now();

/** Start a pick phase (choose performer + 3 cards + 1 method) with rotation among ties */
export async function startPickPhase(code) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;

    const players = room.players || {};
    const uids = Object.keys(players);
    if (uids.length === 0) return room;

    // normalize counters
    for (const uid of uids) {
      const p = players[uid] || {};
      if (!Number.isInteger(p.performed)) p.performed = 0;
      if (!Number.isInteger(p.score)) p.score = 0;
      players[uid] = p;
    }

    // find min performed and the tied set
    let minPerf = Infinity;
    for (const uid of uids) minPerf = Math.min(minPerf, players[uid].performed);
    const tied = uids.filter((uid) => players[uid].performed === minPerf).sort();

    // rotate away from last performer if possible
    const last = room.lastPerformerUid || null;
    let candidate = tied[0];
    if (last && tied.length > 1) {
      const i = tied.indexOf(last);
      if (i !== -1) candidate = tied[(i + 1) % tied.length];
    }

    // prompt
    const cardIndexes = shuffle([...Array(WordCardData.length).keys()]).slice(0, 3);
    const methodIndex = Math.floor(Math.random() * MethodData.length);

    return {
      ...room,
      players,
      phase: "pick",
      performerUid: candidate,
      prompt: { cards: cardIndexes, methodIndex, choice: null },
      timers: { ...(room.timers || {}), pickEndsAt: nowMs() + 20_000 }, // 20s
      round: room.round || 1,
      winner: null,
    };
  });
}

/** Performer locks their choice and starts the guess phase (90s) */
export async function startGuessPhase(code, cardIndex, methodIndex) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.phase === "guess" && room.prompt?.choice) return room; // idempotent

    return {
      ...room,
      phase: "guess",
      prompt: {
        ...(room.prompt || {}),
        choice: { cardIndex, methodIndex },
      },
      timers: { ...(room.timers || {}), roundEndsAt: nowMs() + 90_000 }, // 90s
      winner: null,
    };
  });
}

/** First correct guess wins: set winner +1 score → round_end */
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
      players: { ...players, [uid]: { ...p, score: score + 1 } },
      winner: { uid, name, guessAt: nowMs() },
      phase: "round_end",
    };
  });
}

/**
 * Advance to next round or game end (idempotent):
 * - only runs when phase === "round_end"
 * - guards with lastResolvedRound so multiple clients can safely call it
 */
export async function advanceOrEnd(code) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;

    const currentRound = room.round || 1;
    // Only resolve if we're in round_end and haven't resolved this round yet
    if (room.phase !== "round_end") return room;
    if (room.lastResolvedRound === currentRound) return room;

    const players = { ...(room.players || {}) };
    const perfUid = room.performerUid;

    // Mark current performer as performed +1
    if (perfUid && players[perfUid]) {
      const old = Number.isInteger(players[perfUid].performed)
        ? players[perfUid].performed
        : 0;
      players[perfUid] = { ...players[perfUid], performed: old + 1 };
    }

    // Everyone performed twice?
    const uids = Object.keys(players);
    const allDone =
      uids.length > 0 &&
      uids.every((uid) =>
        Number.isInteger(players[uid].performed)
          ? players[uid].performed >= 2
          : false
      );

    if (allDone) {
      return {
        ...room,
        players,
        lastResolvedRound: currentRound,  // guard future calls
        lastPerformerUid: perfUid || room.lastPerformerUid || null,
        phase: "game_end",
      };
    }

    // Prep next round; remember who just performed; bump round
    return {
      ...room,
      players,
      winner: null,
      prompt: null,
      performerUid: null,
      lastPerformerUid: perfUid || room.lastPerformerUid || null,
      timers: null,
      lastResolvedRound: currentRound,   // guard future calls
      round: currentRound + 1,
      phase: "pick_prep", // clients should call startPickPhase when they see this
    };
  });
}
