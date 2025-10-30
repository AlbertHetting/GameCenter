import "./Join.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { joinRoom } from "/rooms";

export default function JoinGame() {
  const navigate = useNavigate();

  // Local state
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  // Submit handler
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // Uppercase Transform
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setErr("Please enter a room code.");
      return;
    }

    try {
      await joinRoom(clean);         // User under /rooms/{code}/players/{uid}
      navigate(`/room/${clean}`);    // Go to lobby URL
    } catch (e2) {
      // Show a simple, friendly message depending on errors
      if (e2?.message?.toLowerCase().includes("not found")) {
        setErr("That room code doesn't exist.");
      } else if (e2?.message?.toLowerCase().includes("signed in")) {
        setErr("You must be signed in to join.");
      } else {
        setErr(e2?.message || "Could not join room.");
      }
    }
  }

  return (
    <main className="JoinBackground">
      <section className="joincon">
        <div>
          <Link to="/browse">
            <img
              className="backspace"
              src={import.meta.env.BASE_URL + "/img/BackSpace.png"}
              alt="Return"
            />
          </Link>
        </div>

        <div className="rulecontainer program-icons reveal stagger">
          <div className="logo-game">
            <section className="logocon-join-game">
              <img
                src={import.meta.env.BASE_URL + "/img/GameSquareLogo2.svg"}
                alt="GameSquare Logo"
              />
              <h1>Use the join code</h1>
            </section>
          </div>

          <form onSubmit={onSubmit}>
            <div className="form-joingame">
              <input
                className="input-area-game"
                id="roomcode"
                type="text"
                placeholder="Join Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoCapitalize="characters"   // Helps Mobile
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {err && (
              <p style={{ color: "#f03f59", marginTop: 8 }}>{err}</p>
            )}

            <div className="button-container">
              <div className="continuecon">
                <button type="submit" className="continuebutton">
                  <h4>Join Game</h4>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}