import "./Join.css";
import { Link } from "react-router";


export default function Join() {


  return (
      
    

    <main className="JoinBackground">

      <section className="joincon">
        <div>
            <Link to="/browse">
            <img className="backspace" src="/img/BackSpace.png" alt="Return" />
            </Link>
        </div>


      <div className="rulecontainer program-icons reveal stagger">




      <div className="logo-game">
        <section className="logocon-join-game">
        <img
          src="/img/GameSquareLogo2.svg"
          alt="GameSquare Logo"
        />
        <h1>Use the join code</h1>
        </section>
      </div>
      
      <form >
        <div className="form-joingame">
        <input className="input-area-game"
          id="email"
          type="text"
          placeholder="Join Code"
        />
      
        </div>
    

        <div className="button-container">
            <div className="continuecon">
            <Link to="/" className="continuebutton">
                <h4>Join Game</h4>
            </Link>
            </div>
        
        
      </div>
      </form>

      </div>
      </section>
    </main>

);
  
}