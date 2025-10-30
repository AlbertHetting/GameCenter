import { useEffect, useRef, useState } from "react";
import { auth, db } from "/firebaseClient";
import { useParams, useNavigate } from "react-router";
import { ref, onValue, off } from "firebase/database";
import WordCard from "../components/WordCard";
import WordCardData from "../data/WordCardData.json";
import MethodData from "../data/MethodData.json";
import { startGuessPhase } from "../game";

export default function Performer1() {
  const { code } = useParams();
  const navigate = useNavigate();
  const me = auth.currentUser?.uid;

  const [performerUid, setPerformerUid] = useState(null);
  const [cardsIdx, setCardsIdx] = useState([]);
  const [methodIdx, setMethodIdx] = useState(null);
  const [pickEndsAt, setPickEndsAt] = useState(null);
  const [phase, setPhase] = useState(null);

  // Server time offset (ms), so Date.now() + offsetMs ≈ server time
  const [offsetMs, setOffsetMs] = useState(0);

  // Subscribe server time offset once
  useEffect(() => {
    const offRef = ref(db, ".info/serverTimeOffset");
    const unsub = onValue(offRef, (snap) => {
      const v = snap.val();
      // v is positive if client is behind, negative if ahead
      setOffsetMs(typeof v === "number" ? v : 0);
    });
    return () => off(offRef, "value", unsub);
  }, []);

  // Subscribe prompt + performer + timers
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

  // if player not the performer, go to standby
  useEffect(() => {
    if (!performerUid || !me) return;
    if (performerUid !== me) navigate(`/room/${code}/standby`);
  }, [performerUid, me, code, navigate]);

  // If phase already moved to guess, go to performer2
  useEffect(() => {
    if (phase === "guess") navigate(`/room/${code}/performer2`);
  }, [phase, code, navigate]);

  const methodObj = methodIdx != null ? MethodData[methodIdx] : null;
  const cardObjs = cardsIdx.map((i) => WordCardData[i]).filter(Boolean);

  // 20s countdown & auto-pick (server-aligned)
  const firedRef = useRef(false); 

  useEffect(() => {
    // Only the performer schedules the auto-pick
    if (phase !== "pick") return;
    if (!performerUid || performerUid !== me) return;
    if (!pickEndsAt) return;
    if (firedRef.current) return;

    const serverNow = Date.now() + offsetMs;
    let msLeft = pickEndsAt - serverNow;

    const auto = async () => {
      if (firedRef.current) return;
      firedRef.current = true;
      if (cardsIdx.length && methodIdx != null) {
        await startGuessPhase(code, cardsIdx[0], methodIdx);
        navigate(`/room/${code}/performer2`);
      }
    };

    // If already passed (due to clock skew), pick immediately.
    if (msLeft <= 0) {
      const t = setTimeout(auto, 0);
      return () => clearTimeout(t);
    }

    // Otherwise schedule
    const t = setTimeout(auto, msLeft);
    return () => clearTimeout(t);
  }, [phase, performerUid, me, pickEndsAt, offsetMs, cardsIdx, methodIdx, code, navigate]);

  const onPick = async (cardIndex) => {
    if (methodIdx == null) return;
    // Cancel pending auto
    firedRef.current = true;
    await startGuessPhase(code, cardIndex, methodIdx);
    navigate(`/room/${code}/performer2`);
  };

  const ready = methodObj && cardObjs.length === 3;

  if (!ready) {
    return (
      <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex items-center">
        <p className="text-white text-xl">Getting your prompt…</p>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center">
      <div className="rulecontainer program-icons reveal stagger">
        <div className="flex justify-center">
          <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 italic mt-[10rem]">
            {methodObj.method}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {cardObjs.map((data, idx) => (
            <button key={idx} onClick={() => onPick(cardsIdx[idx])}>
              <WordCard data={data} />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

