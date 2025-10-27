import "./wait.css";

export default function Wait() {





    return (
    <main className="WaitBackground">
    
        <div className="TimerCon">
            <h1> 20 </h1>
          <img className="Timer" src={import.meta.env.BASE_URL + "/img/TimerIcon.png"} alt="" />
        </div>

        <div>
        <section className="WaitInstruction">
          <h2>
            Wait for <span className="player-name">Clara</span> to pick an option
            </h2>
        </section>
        </div>

        <section id="DisplayPlayer">
          <div id="WaitPlayer">
              <img src={import.meta.env.BASE_URL + "/img/ChibiCapybara.png"} alt="" />
          </div>

          <div id="TipText">
            <h3>You can guess as many times as you want within the timeframe!</h3>
          </div>
        </section>
  


    
    </main>
  );
}
