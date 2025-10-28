import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { auth, db } from "/firebaseClient";
import { ref, onValue, off, update } from "firebase/database";
import WordCard from "../components/WordCard";
import WordCardData from "../data/WordCardData.json";
import MethodData from "../data/MethodData.json";

export default function Performer2() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(null);
  const [performerUid, setPerformerUid] = useState(null);
  const [winner, setWinner] = useState(null);

  const [cardIdx, setCardIdx] = useState(null);
  const [methodIdx, setMethodIdx] = useState(null);

  const [roundEndsAt, setRoundEndsAt] = useState(null); // ms epoch
  const [secondsLeft, setSecondsLeft] = useState(90);

  // Subscribe to the room: phase, performer, winner, prompt choice, timer
  useEffect(() => {
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => {
      const v = snap.val() || {};
      setPhase(v.phase || null);
      setPerformerUid(v.performerUid || null);
      setWinner(v.winner || null);

      setCardIdx(v.prompt?.choice?.cardIndex ?? null);
      setMethodIdx(
        v.prompt?.choice?.methodIndex ?? v.prompt?.methodIndex ?? null
      );

      setRoundEndsAt(v.timers?.roundEndsAt ?? null);
    });
    return () => off(roomRef, "value", unsub);
  }, [code]);

  // Trust server navigation if phase changes
  useEffect(() => {
    if (phase === "round_end") navigate(`/room/${code}/round-winner`);
    if (phase === "pick") navigate(`/room/${code}/performer1`);
  }, [phase, code, navigate]);

  // Countdown that starts automatically from roundEndsAt
  useEffect(() => {
    if (!roundEndsAt) return;

    const tick = () => {
      const ms = roundEndsAt - Date.now();
      const s = Math.max(0, Math.ceil(ms / 1000));
      setSecondsLeft(s);
    };

    // initial render
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [roundEndsAt]);

  // When timer hits 0 and there's no winner, let the performer end the round
  useEffect(() => {
    const me = auth.currentUser?.uid;
    if (!me || !performerUid) return;
    if (secondsLeft > 0) return;
    if (winner) return;                 // already decided
    if (phase !== "guess") return;      // only act during guess phase
    if (me !== performerUid) return;    // only the performer flips the phase to avoid races

    // Mark the round as ended with no winner; everyone will navigate via phase change
    update(ref(db, `rooms/${code}`), { phase: "round_end" }).catch(console.error);
  }, [secondsLeft, winner, phase, performerUid, code]);

  const card = cardIdx != null ? WordCardData[cardIdx] : null;
  const method = methodIdx != null ? MethodData[methodIdx] : null;

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center justify-center">
      {/* 90s countdown */}
      <div className="text-white text-4xl font-semibold font-['Poppins'] flex mt-6 justify-center items-center gap-3">
        <div><p>{secondsLeft}</p></div>
        <div><img src={import.meta.env.BASE_URL + "/img/icon-timer-white.svg"} alt="" /></div>
      </div>

      {/* Method */}
      <div className="w-96 text-center text-white text-base font-medium leading-6 px-4 mt-5">
        {method ? method.method : ""}
      </div>

      {/* Chosen card */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        {card && <WordCard data={card} />}
      </div>
    </main>
  );
}

