import { useEffect, useMemo, useState } from "react";
import { auth, db } from "/firebaseClient";
import { useParams, useNavigate } from "react-router";
import { ref, onValue, off } from "firebase/database";
import WordCard from "../components/WordCard";
import Method from "../components/Method";   // ✅ import the component
import WordCardData from "../data/WordCardData";
import MethodData from "../data/MethodData.json"; // ✅ import the JSON data
import { startGuessPhase } from "/game";


export default function Performer1() {
  const { code } = useParams();
  const navigate = useNavigate();
  const me = auth.currentUser?.uid;

  const [performerUid, setPerformerUid] = useState(null);
  const [cardsIdx, setCardsIdx] = useState([]);      // [i,j,k]
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
  const cardObjs = cardsIdx.map((i) => WordCardData[i]);

  // 20s countdown & auto-pick
  useEffect(() => {
    if (!pickEndsAt) return;
    const msLeft = pickEndsAt - Date.now();
    if (msLeft <= 0) {
      // auto-pick first card if nothing chosen
      if (cardsIdx.length && methodIdx != null) {
        startGuessPhase(code, cardsIdx[0], methodIdx).then(() => {
          navigate(`/room/${code}/performer2`);
        });
      }
      return;
    }
    const t = setTimeout(() => {
      if (cardsIdx.length && methodIdx != null) {
        startGuessPhase(code, cardsIdx[0], methodIdx).then(() => {
          navigate(`/room/${code}/performer2`);
        });
      }
    }, msLeft);
    return () => clearTimeout(t);
  }, [pickEndsAt, cardsIdx, methodIdx, code, navigate]);

  const onPick = async (cardIndex) => {
    if (methodIdx == null) return;
    await startGuessPhase(code, cardIndex, methodIdx);
    navigate(`/room/${code}/performer2`);
  };

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center">
      {/* timer UI (optional): show seconds remaining */}
      {/* method */}
      {methodObj && <Method data={methodObj} />}

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
