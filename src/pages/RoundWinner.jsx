import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { db } from "/firebaseClient";
import { ref, onValue, off } from "firebase/database";
import WordCardData from "../data/WordCardData.json";
import chibis from "../data/Images.json";
import { advanceOrEnd, startPickPhase } from "../game";

export default function RoundWinner() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState({});

  useEffect(() => {
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => setRoom(snap.val() || {}));
    return () => off(roomRef, "value", unsub);
  }, [code]);

  const cardIdx = room?.prompt?.choice?.cardIndex ?? null;
  const word = cardIdx != null ? WordCardData[cardIdx]?.word : "";
  const winner = room?.winner || null;
  const players = room?.players || {};
  const wPlayer = winner?.uid ? players[winner.uid] : null;
  const wImg =
    wPlayer?.avatarIndex != null ? chibis[wPlayer.avatarIndex]?.src : chibis[0].src;

  // After 10s → advance or end
  useEffect(() => {
    const t = setTimeout(async () => {
      await advanceOrEnd(code);
      // listen for phase transition
    }, 10000);
    return () => clearTimeout(t);
  }, [code]);

  // react to phase change
  useEffect(() => {
    if (!room?.phase) return;
    if (room.phase === "game_end") navigate(`/room/${code}/gameend`);
    if (room.phase === "pick_prep") {
      // start next pick (assign next performer)
      startPickPhase(code);
    }
    if (room.phase === "pick") {
      // back into the pick flow
      navigate(`/room/${code}/standby`);
    }
  }, [room?.phase, code, navigate]);

  const hasWinner = !!winner;

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center justify-evenly">
      <div className="w-96 h-24 text-center justify-start">
        <span className="text-white text-4xl font-semibold">The word was </span>
        <span className="text-rose-300 text-4xl font-semibold">{word || "—"}</span>
      </div>

      {hasWinner ? (
        <>
          <div className="w-60 h-auto">
            <img
              src={import.meta.env.BASE_URL + (wImg || "/img/ChibiCapybara.png")}
              alt=""
            />
          </div>

          <div>
            <div className="text-center text-rose-300 text-4xl font-extrabold">
              {(winner?.name || "Someone").toUpperCase()}
            </div>
            <div className="text-center text-white text-4xl font-semibold">
              Was the fastest!
            </div>
          </div>
        </>
      ) : (
        <>
          {/* No winner UI */}
          <div className="text-center">
            <div className="text-white text-4xl font-semibold">Time’s up!</div>
            <div className="text-rose-300 text-2xl font-semibold mt-2">
              No one got it — no points awarded.
            </div>
          </div>
        </>
      )}
    </main>
  );
}