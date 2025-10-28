import { useEffect, useState } from "react";
import { auth, db } from "/firebaseClient"; // adjust path if needed
import { useParams, useNavigate } from "react-router";
import { ref, onValue, off } from "firebase/database";
import WordCard from "../components/WordCard";
import Method from "../components/Method";
import WordCardData from "../data/WordCardData.json";  // ✅ JSON
import MethodData from "../data/MethodData.json";       // ✅ JSON
import { startGuessPhase } from "../game";               // ✅ shared game helper

export default function Performer1() {
  const { code } = useParams();
  const navigate = useNavigate();
  const me = auth.currentUser?.uid;

  const [performerUid, setPerformerUid] = useState(null);
  const [cardsIdx, setCardsIdx] = useState([]); // [i,j,k]
  const [methodIdx, setMethodIdx] = useState(null);
  const [pickEndsAt, setPickEndsAt] = useState(null);
  const [phase, setPhase] = useState(null);

  // subscribe prompt + performer + timers
  useEffect(() => {
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => {
      const v = snap.val() || {};
      setPerformerUid(v.performerUid || null);
      setPhase(v.phase || null);
      setPickEndsAt(v.timers?.pickEndsAt || null);
      if (v.prompt) {
        setCardsIdx(v.prompt.cards || []);
        setMethodIdx(v.prompt.methodIndex ?? null);
      }
    });
    return () => off(roomRef, "value", unsub);
  }, [code]);

  // if I'm not the performer, go to standby
  useEffect(() => {
    if (!performerUid || !me) return;
    if (performerUid !== me) navigate(`/room/${code}/standby`);
  }, [performerUid, me, code, navigate]);

  // if phase already moved to guess, go to performer2
  useEffect(() => {
    if (phase === "guess") navigate(`/room/${code}/performer2`);
  }, [phase, code, navigate]);

  const methodObj = methodIdx != null ? MethodData[methodIdx] : null;
  const cardObjs = cardsIdx.map((i) => WordCardData[i]).filter(Boolean);

  // 20s countdown & auto-pick (if user doesn't choose)
  useEffect(() => {
    if (!pickEndsAt) return;
    if (phase !== "pick") return;
    if (!performerUid || performerUid !== me) return;

    const auto = async () => {
      if (cardsIdx.length && methodIdx != null) {
        await startGuessPhase(code, cardsIdx[0], methodIdx);
        navigate(`/room/${code}/performer2`);
      }
    };

    const msLeft = pickEndsAt - Date.now();
    const GRACE_MS = 600; // small floor to avoid instant fire on first mount
    const t = setTimeout(auto, Math.max(msLeft, GRACE_MS));
    return () => clearTimeout(t);
  }, [pickEndsAt, phase, performerUid, me, cardsIdx, methodIdx, code, navigate]);

  const onPick = async (cardIndex) => {
    if (methodIdx == null) return;
    await startGuessPhase(code, cardIndex, methodIdx);
    navigate(`/room/${code}/performer2`);
  };

  const ready = methodObj && cardObjs.length === 3;

  if (!ready) {
    return (
      <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex items-center justify-center">
        <p className="text-white text-xl">Getting your prompt…</p>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center">
      {/* Method */}
      <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 italic mt-6">
        {methodObj.method}
      </div>

      {/* three cards to choose */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        {cardObjs.map((data, idx) => (
          <button key={idx} onClick={() => onPick(cardsIdx[idx])}>
            <WordCard data={data} />
          </button>
        ))}
      </div>
    </main>
  );
}
