import "./Guess.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { auth, db } from "/firebaseClient";
import { ref, onValue, off } from "firebase/database";
import WordCardData from "../data/WordCardData.json";
import { trySetWinnerAndScore } from "../game";

export default function Guessing() {
  const { code } = useParams();
  const navigate = useNavigate();
  const me = auth.currentUser;

  const [performerUid, setPerformerUid] = useState(null);
  const [players, setPlayers] = useState({});
  const [phase, setPhase] = useState(null);
  const [cardIdx, setCardIdx] = useState(null);

  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => {
      const v = snap.val() || {};
      setPhase(v.phase || null);
      setPerformerUid(v.performerUid || null);
      setPlayers(v.players || {});
      setCardIdx(v.prompt?.choice?.cardIndex ?? null);
    });
    return () => off(roomRef, "value", unsub);
  }, [code]);

  useEffect(() => {
    if (phase === "round_end") navigate(`/room/${code}/round-winner`);
  }, [phase, code, navigate]);

  const card = cardIdx != null ? WordCardData[cardIdx] : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!card) return;

    const target = card.word.trim().toLowerCase();
    const mine = guess.trim().toLowerCase();

    if (!mine) return;
    if (mine === target) {
      await trySetWinnerAndScore(code, me.uid, me.displayName || "Player");
      // Routing happens via phase change
    } else {
      setError("Nope! Try again.");
    }
    setGuess("");
  };

  const perfName = players[performerUid]?.name || "Player";

  return (
    <main className="GuessBackground">
      <section className="GuessInstruction">
        <h2>
          Try to guess what <span className="player-name">{perfName}</span> is acting out!
        </h2>
      </section>

      <div id="category">
        <h5>
          Category: <span className="category">{card?.title || "—"}</span>
        </h5>
      </div>

      <form id="guessform" onSubmit={onSubmit}>
        <div className="form-joingame">
          <input
            className="input-area-guess"
            id="guess"
            type="text"
            placeholder="Guess Here"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            autoComplete="off"
          />
        </div>
        {error && <p style={{ color: "#f03f59" }}>{error}</p>}

        <div className="Guess-Submit">
          <button className="SubmitGuess" type="submit">
            <h4>Submit Answer</h4>
          </button>
        </div>
      </form>

      <div id="GameTipsText">
        <h3>remember there are no stupid guesses, except for the stupid ones!</h3>
      </div>
    </main>
  );
}
