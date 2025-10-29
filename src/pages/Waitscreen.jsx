import "./wait.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router"; // use react-router-dom
import { auth, db } from "/firebaseClient";                // adjust path if needed
import { ref, onValue, off } from "firebase/database";
import chibis from "../data/Images.json";

export default function Wait() {
  const { code } = useParams();
  const navigate = useNavigate();
  const me = auth.currentUser?.uid;

  const [performerUid, setPerformerUid] = useState(null);
  const [players, setPlayers] = useState({});
  const [phase, setPhase] = useState(null);

  useEffect(() => {
    if (!code) return;
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => {
      const v = snap.val() || {};
      setPlayers(v.players || {});
      setPerformerUid(v.performerUid || null); // ✅ fixed
      setPhase(v.phase || null);
    });
    return () => off(roomRef, "value", unsub);
  }, [code]);

  // react to phase changes
  useEffect(() => {
    if (!phase) return;
    if (phase === "guess") navigate(`/room/${code}/guessing`);
    if (phase === "pick" && performerUid === me) navigate(`/room/${code}/performer1`);
  }, [phase, performerUid, me, code, navigate]);

  const perf = performerUid ? players[performerUid] : null;
  const perfImg =
    perf?.avatarIndex != null ? chibis[perf.avatarIndex]?.src : chibis[0].src;

  return (
    <main className="WaitBackground">

      <div className="rulecontainer program-icons reveal stagger">
      <section className="WaitInstruction">
        <h2>
          Wait for <span className="player-name">{perf?.name || "Player"}</span>{" "}
          to pick an option
        </h2>
      </section>

      <section id="DisplayPlayer">
        <div id="WaitPlayer">
          <img
            src={import.meta.env.BASE_URL + (perfImg || "/img/ChibiCapybara.png")}
            alt=""
          />
        </div>

        <div id="TipText">
          <h3>You can guess as many times as you want within the timeframe!</h3>
        </div>
      </section>
      </div>
    </main>
  );
}
