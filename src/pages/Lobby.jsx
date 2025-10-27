import "./Lobbystyle.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { auth, db } from "/firebaseClient";
import { ref, set, onValue, off } from "firebase/database";

export default function Lobby() {
  const { code } = useParams();             // /room/:code
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [players, setPlayers] = useState({}); // { uid: name }

  // Put myself into the players list when I land in the room
  useEffect(() => {
    const u = auth.currentUser;
    if (!u || !code) return;
    const name = u.displayName || "Player";
    set(ref(db, `rooms/${code}/players/${u.uid}`), name);
  }, [code]);

  // Subscribe to players live
  useEffect(() => {
    if (!code) return;
    const playersRef = ref(db, `rooms/${code}/players`);
    const unsub = onValue(playersRef, (snap) => {
      setPlayers(snap.val() || {});
    });
    return () => off(playersRef, "value", unsub);
  }, [code]);

  const handleStart = async (e) => {
    e.preventDefault();
    const v = videoRef.current;
    if (!v) return;
    setShowVideo(true);
    try {
      v.muted = false;
      v.currentTime = 0;
      await v.play();
      // Optionally update room state so other clients can react:
      // set(ref(db, `rooms/${code}/state`), "introVideo");
    } catch (err) {
      console.error("Video play failed:", err);
    }
  };

  const handleEnded = () => {
    navigate("/performer1"); // go to next part of the game
  };

  return (
    <main className="lobbybackground">
      <section id="gamelobby" className={showVideo ? "is-hidden" : ""}>
        <div className="logomysterycon">
          <img
            className="logomystery"
            src={import.meta.env.BASE_URL + "/img/MysteryBowl.png"}
            alt=""
          />
        </div>

        <section className="lobbycode">
          <h2>Room Code:</h2>
          <h1>{code}</h1> {/* show the real code from URL */}
        </section>

        <section id="playerconLobby">
          <h1 id="PlayerText">Players</h1>
          <div id="players">
            {Object.entries(players).map(([uid, name]) => (
              <div className="playerindividual" key={uid}>
                <img
                  src={import.meta.env.BASE_URL + "/img/ChibiCapybara.png"}
                  alt=""
                />
                <h3>{name}</h3>
              </div>
            ))}
          </div>

          <section id="startinggame">
            <h5>Is the gang ready?</h5>
            <div className="StartCon">
              <button className="Startbutton" onClick={handleStart}>
                <h4>Start Game!</h4>
              </button>
            </div>
          </section>
        </section>
      </section>

      <video
        id="introvideo"
        className={showVideo ? "is-visible" : ""}
        ref={videoRef}
        src={import.meta.env.BASE_URL + "/videos/VideoIntro.mp4"}
        playsInline
        preload="auto"
        onEnded={handleEnded}
      />
    </main>
  );
}