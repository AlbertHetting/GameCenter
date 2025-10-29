import "./gameend.css";
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { useNavigate } from "react-router";
import { db } from "/firebaseClient";
import { ref, onValue, off, remove } from "firebase/database";
import chibis from "../data/Images.json";

export default function GameEnd() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const roomRef = ref(db, `rooms/${code}/players`);
    const unsub = onValue(roomRef, (snap) => setPlayers(snap.val() || {}));
    return () => off(roomRef, "value", unsub);
  }, [code]);

  // Auto-delete room + return to browse after 60s
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (code) {
          await remove(ref(db, `rooms/${code}`)); // safe if already removed
        }
      } finally {
        navigate("/browse", { replace: true });
      }
    }, 60_000);

    return () => clearTimeout(t);
  }, [code, navigate]);

  // Optional: immediate cleanup + navigate when pressing the button
  async function handleBackNow() {
    try {
      if (code) {
        await remove(ref(db, `rooms/${code}`));
      }
    } finally {
      navigate("/browse", { replace: true });
    }
  }

  const top3 = useMemo(() => {
    return Object.entries(players)
      .map(([uid, p]) => ({
        uid,
        ...p,
        score: Number.isInteger(p.score) ? p.score : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [players]);

  return (
    <main className="EndBackground">
      <div className="rulecontainer program-icons reveal stagger">
      <div className="logomysteryconEnd">
        <img
          className="logomysteryEnd"
          src={import.meta.env.BASE_URL + "/img/MysteryBowl.png"}
          alt=""
        />
      </div>

      {/* Winner podium */}
      <section className="firstplace">
        {top3[0] && (
          <div className="avatar-container">
            <p>1st</p>
            <img
              src={
                import.meta.env.BASE_URL +
                (chibis[top3[0].avatarIndex]?.src || "/img/ChibiCapybara.png")
              }
              alt=""
            />
            <h1>{top3[0].name || "Player"}</h1>
            <h3>{top3[0].score} pts</h3>
          </div>
        )}
      </section>

      <div className="secondand3place">
        {top3[1] && (
          <section>
            <div className="avatar-container">
              <p>2nd</p>
              <img
                src={
                  import.meta.env.BASE_URL +
                  (chibis[top3[1].avatarIndex]?.src || "/img/ChibiKitty.png")
                }
                alt=""
              />
              <h1>{top3[1].name || "Player"}</h1>
              <h3>{top3[1].score} pts</h3>
            </div>
          </section>
        )}
        {top3[2] && (
          <section>
            <div className="avatar-container">
              <p>3rd</p>
              <img
                src={
                  import.meta.env.BASE_URL +
                  (chibis[top3[2].avatarIndex]?.src || "/img/ChibiPanda.png")
                }
                alt=""
              />
              <h1>{top3[2].name || "Player"}</h1>
              <h3>{top3[2].score} pts</h3>
            </div>
          </section>
        )}
      </div>
      <Link to="/browse">
      <div className="BackCon">
        <button className="BackbuttonEnd" onClick={handleBackNow}>
          <h4>Back to browse</h4>
        </button>
      </div>
      </Link>
      </div>
    </main>
  );
}