import "./Lobbystyle.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { auth, db } from "/firebaseClient";
import {
  ref,
  onValue,
  off,
  runTransaction,
  get,
  child,
  set,
} from "firebase/database";
import chibis from "../data/Images.json";
import { startPickPhase } from "../game";
import { Link } from "react-router";

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  // keep track to not re-run play() loop repeatedly
  const [videoStartedLocally, setVideoStartedLocally] = useState(false);

  // players: { uid: { name, avatarIndex, joinedAt, performed?, score? } }
  const [players, setPlayers] = useState({});
  const [phase, setPhase] = useState("lobby");
  const [performerUid, setPerformerUid] = useState(null);

  const me = auth.currentUser?.uid || null;

  // JOIN: add player and assign avatarIndex; also MIGRATE older string entries
  useEffect(() => {
    const u = auth.currentUser;
    if (!u || !code) return;

    const playersRef = ref(db, `rooms/${code}/players`);

    runTransaction(playersRef, (current) => {
      const list = current || {};

      // Normalize existing entries
      const normalized = {};
      const now = Date.now();
      for (const [uid, val] of Object.entries(list)) {
        if (typeof val === "string") {
          normalized[uid] = { name: val, avatarIndex: null, joinedAt: now };
        } else if (val && typeof val === "object") {
          normalized[uid] = {
            name: val.name || "Player",
            avatarIndex: Number.isInteger(val.avatarIndex)
              ? val.avatarIndex
              : null,
            joinedAt: typeof val.joinedAt === "number" ? val.joinedAt : now,
            score: Number.isInteger(val.score) ? val.score : 0,
            performed: Number.isInteger(val.performed) ? val.performed : 0,
          };
        }
      }

      if (!normalized[u.uid]) {
        normalized[u.uid] = {
          name: u.displayName || "Player",
          avatarIndex: null,
          joinedAt: now,
          score: 0,
          performed: 0,
        };
      } else {
        normalized[u.uid].name = u.displayName || "Player";
        if (!Number.isInteger(normalized[u.uid].score))
          normalized[u.uid].score = 0;
        if (!Number.isInteger(normalized[u.uid].performed))
          normalized[u.uid].performed = 0;
      }

      // Assign avatars
      const max = chibis.length;
      const taken = new Set(
        Object.values(normalized)
          .map((p) => (Number.isInteger(p.avatarIndex) ? p.avatarIndex : null))
          .filter((x) => x !== null)
      );

      const pending = Object.entries(normalized)
        .filter(([_, p]) => !Number.isInteger(p.avatarIndex))
        .sort(
          (a, b) =>
            (a[1].joinedAt ?? 0) - (b[1].joinedAt ?? 0) ||
            a[0].localeCompare(b[0])
        );

      for (const [uid, p] of pending) {
        let idx = 0;
        while (taken.has(idx) && idx < max) idx++;
        if (idx >= max) {
          if (uid === u.uid) delete normalized[uid]; // full
          continue;
        }
        p.avatarIndex = idx;
        taken.add(idx);
      }

      return normalized;
    }).then(async () => {
      const meSnap = await get(
        child(ref(db), `rooms/${code}/players/${auth.currentUser.uid}`)
      );
      if (!meSnap.exists()) navigate("/browse");
    });
  }, [code, navigate]);

  // ---- LIVE SUBSCRIBE: keep players + phase updated
  useEffect(() => {
    if (!code) return;
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snap) => {
      const v = snap.val() || {};
      setPlayers(v.players || {});
      setPhase(v.phase || "lobby");
      setPerformerUid(v.performerUid || null);
    });
    return () => off(roomRef, "value", unsub);
  }, [code]);

  // ---- VIDEO SYNC: when rooms/{code}/video flips to playing=true, show + play on ALL clients
  useEffect(() => {
    if (!code) return;
    const videoStateRef = ref(db, `rooms/${code}/video`);
    const unsub = onValue(videoStateRef, async (snap) => {
      const vs = snap.val() || {};
      if (!vs.playing) return;

      // Show video everywhere (CSS hides lobby)
      setShowVideo(true);

      // Only attempt to start once per client
      if (videoStartedLocally) return;

      const el = videoRef.current;
      if (!el) return;

      // Initiator can play with sound; others should use muted autoplay for reliability
      const iAmInitiator = vs.startedBy && vs.startedBy === me;

      try {
        el.currentTime = 0;
        el.muted = !iAmInitiator; // initiator = sound on; others = muted autoplay
        await el.play();
        setVideoStartedLocally(true);
      } catch (err) {
        // If autoplay is still blocked, the element is visible;
        // user can tap native controls to start.
        console.warn("Autoplay blocked on this client:", err);
      }
    });
    return () => off(videoStateRef, "value", unsub);
  }, [code, me, videoStartedLocally]);

  // ---- PHASE ROUTING
  useEffect(() => {
    if (!me) return;
    if (phase === "pick") {
      if (performerUid === me) navigate(`/room/${code}/performer1`);
      else navigate(`/room/${code}/standby`);
    }
  }, [phase, performerUid, code, navigate, me]);

  // ---- BUTTONS

  // ANY player can click "Watch video" → broadcast playing=true (global start)
  const handleStart = async (e) => {
    e.preventDefault();
    try {
      await set(ref(db, `rooms/${code}/video`), {
        playing: true,
        startedAt: Date.now(),
        startedBy: me || null,
      });

      // Start locally for the clicker immediately with sound
      const el = videoRef.current;
      if (el) {
        setShowVideo(true);
        el.muted = false;
        el.currentTime = 0;
        await el.play().catch(() => {});
        setVideoStartedLocally(true);
      }
    } catch (err) {
      console.error("Failed to broadcast video start:", err);
    }
  };

  // Skip video and start the game immediately
  const handleSkipVideo = async () => {
    try {
      await startPickPhase(code);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleEnded = async () => {
    await startPickPhase(code);
    // optional: reset video state so re-entering the lobby doesn’t auto-play
    await set(ref(db, `rooms/${code}/video`), { playing: false, startedAt: null, startedBy: null });
  };

  // Stable rendering order: by avatarIndex (Capybara..Whale)
  const sorted = Object.entries(players).sort(
    (a, b) => (a[1]?.avatarIndex ?? 999) - (b[1]?.avatarIndex ?? 999)
  );

  return (
    <main className="lobbybackground">
      <div className="rulecontainer program-icons reveal stagger">
      <section id="gamelobby" className={showVideo ? "is-hidden" : ""}>

          <div className="Back2Browse">
          <Link to="/browse">
            <img
              className="backspace"
              src={import.meta.env.BASE_URL + "/img/BackSpace.png"}
              alt="Return"
            />
          </Link>
        </div>

        <div className="logomysterycon">
          <img
            className="logomystery"
            src={import.meta.env.BASE_URL + "/img/MysteryBowl.png"}
            alt=""
          />
        </div>

        <section className="lobbycode">
          <h2>Room Code:</h2>
          <h1>{code}</h1>
        </section>

        <section id="playerconLobby">
          <h1 id="PlayerText">Players</h1>

          <div id="players">
            {sorted.map(([uid, p]) => {
              const src = chibis[p?.avatarIndex]?.src || chibis[0].src;
              return (
                <div className="playerindividual" key={uid}>
                  <img src={import.meta.env.BASE_URL + src} alt="" />
                  <h3>{p?.name || "Player"}</h3>
                </div>
              );
            })}
          </div>

          <section id="startinggame">
            <h5>Is the gang ready?</h5>
            <div className="StartCon">
              <button className="Startbutton" onClick={handleSkipVideo}>
                <h4>Start Game!</h4>
              </button>
            </div>
            <h5 className="mt-10">Need help?</h5>
            <div className="StartCon">
              <button className="Startbutton" onClick={handleStart}>
                <h4>Watch video</h4>
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
      </div>
    </main>
  );
}


