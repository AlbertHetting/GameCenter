import "./Lobbystyle.css";
import { useRef, useState } from "react";
import { Navigate } from "react-router";
// If you need navigation after video ends, import useNavigate from react-router-dom

export default function Lobby() {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault(); 
    const v = videoRef.current;
    if (!v) return;

    // Show video / hide lobby first so it’s clear something happened
    setShowVideo(true);

    try {
      v.muted = false;          
      v.currentTime = 0;        
      await v.play();           
    } catch (err) {
      console.error("Video play failed:", err);

    }
  };

  const handleEnded = () => {
    Navigate("/"); 
  };

  return (
    <main className="lobbybackground">
      <section id="gamelobby" className={showVideo ? "is-hidden" : ""}>
        <div className="logomysterycon">
          <img className="logomystery" src={import.meta.env.BASE_URL + "/img/MysteryBowl.png"} alt="" />
        </div>

        <section className="lobbycode">
          <h2>Room Code:</h2>
          <h1>KCPT78</h1>
        </section>

        <section id="playerconLobby">
          <h1 id="PlayerText">Players</h1>

          <div id="players">
            <div className="playerindividual">
              <img src={import.meta.env.BASE_URL + "/img/ChibiCapybara.png"} alt="" />
              <h3>Albert</h3>
            </div>
            <div className="playerindividual">
              <img src={import.meta.env.BASE_URL + "/img/ChibiKitty.png"} alt="" />
              <h3>Clara</h3>
            </div>
            <div className="playerindividual">
              <img src={import.meta.env.BASE_URL + "/img/ChibiPanda.png"} alt="" />
              <h3>Bjarke</h3>
            </div>
            <div className="playerindividual">
              <img src={import.meta.env.BASE_URL + "/img/ChibiWhale.png"} alt="" />
              <h3>Oliver</h3>
            </div>
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