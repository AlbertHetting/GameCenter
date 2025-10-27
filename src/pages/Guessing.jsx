import "./Guess.css";

export default function Guessing() {





    return (
    <main className="GuessBackground">
    
        <div className="TimerCon">
            <h1> 90 </h1>
          <img className="Timer" src={import.meta.env.BASE_URL + "/img/TimerIcon.png"} alt="" />
        </div>

        <div>
        <section className="GuessInstruction">
          <h2>
            Try to guess what <span className="player-name">Clara</span> is acting out!
            </h2>
        </section>
        </div>


            <div id="category">
                <h5>Category: <span className="category"> Person </span></h5>
            </div>
         <form id="guessform">
        <div className="form-joingame">
        <input className="input-area-guess"
          id="email"
          type="text"
          placeholder="Guess Here" />
        </div>

        <div className="Guess-Submit">
            <div className="SubmitGuess">
                <h4>Submit Answer</h4>
            </div>
      </div>
      </form>


        <div id="GameTipsText">
            <h3>remember there are no stupid guesses, except for the stupid ones!</h3>
        </div>

    
    </main>
  );
}
