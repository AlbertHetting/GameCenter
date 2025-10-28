import "./Lobbystyle.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { auth, db } from "/firebaseClient";
import { ref, set, onValue, off, runTransaction, get, child } from "firebase/database";
import chibis from "../data/Images.json";

// ⬇️ tiny helper that starts the pick phase (choose performer + prompt)
// If you already created startPickPhase in lib/game, import and use that instead.
async function startPickPhaseInline(code) {
  const roomRef = ref(db, `rooms/${code}`);
  await runTransaction(roomRef, (room) => {
    if (!room) return room;

    // players map present?
    const players = room.players || {};
    const uids = Object.keys(players);
    if (uids.length === 0) return room;

    // pick performer: fewest performed (tie-break by uid)
    let candidate = null;
    let min = Infinity;
    for (const uid of uids) {
      const p = players[uid] || {};
      const perf = Number.isInteger(p.performed) ? p.performed : 0;
      if (perf < min || (perf === min && uid < candidate)) {
        min = perf;
        candidate = uid;
      }
    }

    // 3 random cards (indexes) + 1 random method index
    // NOTE: replace with your WordCardData/MethodData indexes later if desired
    const random = (n) => Math.floor(Math.random() * n);
    const threeIndexes = Array.from({ length: 3 }, () => random(20)); // placeholder range
    const methodIndex = random(10); // placeholder range

    const pickEndsAt = Date.now() + 20_000; // 20s to pick

    return {
      ...room,
      phase: "pick",
      performerUid: candidate,
      prompt: {
        cards: threeIndexes,
        methodIndex,
        choice: null,
      },
      timers: { ...(room.timers || {}), pickEndsAt },
      round: room.round || 1,
    };
  });
}

export default function Lobby() {
  const { code } = useParams(); // /room/:code
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  // players: { uid: { name, avatarIndex, joinedAt, performed?, score? } }
  const [players, setPlayers] = useState({});
  const [phase, setPhase] = useState("lobby");
  const [performerUid, setPerformerUid] = useState(null);

  // ---- JOIN: add myself and assign avatarIndex; also MIGRATE older string entries
  useEffect(() => {
    const u = auth.currentUser;
    if (!u || !code) return;

    const playersRef = ref(db, `rooms/${code}/players`);

    runTransaction(playersRef, (current) => {
      const list = current || {};

      // 1) Normalize existing entries: "Albert" -> { name: "Albert", avatarIndex: null, joinedAt }
      const normalized = {};
      const now = Date.now();
      for (const [uid, val] of Object.entries(list)) {
        if (typeof val === "string") {
          normalized[uid] = { name: val, avatarIndex: null, joinedAt: now };
        } else if (val && typeof val === "object") {
          normalized[uid] = {
            name: val.name || "Player",
            avatarIndex:
              Number.isInteger(val.avatarIndex) ? val.avatarIndex : null,
            joinedAt: typeof val.joinedAt === "number" ? val.joinedAt : now,
            score: Number.isInteger(val.score) ? val.score : 0,
            performed: Number.isInteger(val.performed) ? val.performed : 0,
          };
        }
      }

      // 2) Ensure I'm in the list (preserve avatar if I already have one)
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
        if (!Number.isInteger(normalized[u.uid].score)) normalized[u.uid].score = 0;
        if (!Number.isInteger(normalized[u.uid].performed)) normalized[u.uid].performed = 0;
      }

      // 3) Compute which avatar indexes are already taken
      const max = chibis.length; // 6
      const taken = new Set(
        Object.values(normalized)
          .map((p) => (Number.isInteger(p.avatarIndex) ? p.avatarIndex : null))
          .filter((x) => x !== null)
      );

      // 4) Assign avatarIndex to anyone who doesn't have one, in joinedAt order
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
          // lobby full -> don't add new players without index
          if (uid === u.uid) delete normalized[uid]; // boot me if no slot
          continue;
        }
        p.avatarIndex = idx;
        taken.add(idx);
      }

      return normalized;
    }).then(async () => {
      // If I wasn't added (room full), bounce out
      const meSnap = await get(
        child(ref(db), `rooms/${code}/players/${auth.currentUser.uid}`)
      );
      if (!meSnap.exists()) {
        navigate("/browse");
      }
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

  // ---- PHASE ROUTING: when pick phase starts, split performer vs others
  useEffect(() => {
    const me = auth.currentUser?.uid;
    if (!me) return;
    if (phase === "pick") {
      if (performerUid === me) navigate(`/room/${code}/performer1`);
      else navigate(`/room/${code}/standby`);
    }
  }, [phase, performerUid, code, navigate]);

  // ---- VIDEO FLOW
  const handleStart = async (e) => {
    e.preventDefault();
    const v = videoRef.current;
    if (!v) return;
    setShowVideo(true);
    try {
      v.muted = false;
      v.currentTime = 0;
      await v.play();
    } catch (err) {
      console.error("Video play failed:", err);
    }
  };

  const handleEnded = async () => {
    // ✅ Kick off the pick phase on the server, then the phase effect will route everyone
    await startPickPhaseInline(code);
  };

  // Stable rendering order: by avatarIndex (Capybara..Whale)
  const sorted = Object.entries(players).sort(
    (a, b) => (a[1]?.avatarIndex ?? 999) - (b[1]?.avatarIndex ?? 999)
  );

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
          <h1>{code}</h1>
        </section>

        <section id="playerconLobby">
          <h1 id="PlayerText">Players</h1>

          <div id="players">
            {sorted.map(([uid, p]) => {
              const src = chibis[p?.avatarIndex]?.src || chibis[0].src; // fallback
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