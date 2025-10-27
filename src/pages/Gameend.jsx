import "./gameend.css";
import { Link } from "react-router";

export default function GameEnd(){



    return(
        
        <main className="EndBackground">
    
        <div className="logomysteryconEnd">
          <img className="logomysteryEnd" src={import.meta.env.BASE_URL + "/img/MysteryBowl.png"} alt="" />
        </div>


            <div id="lucktext">
            <h1>Better luck next round :) </h1>
            </div>
        <section>
          <div className="avatar-container">
                    <p>PLACE</p>
                    <img src="public/img/ChibiCapybara.png" alt="" />
                    <h1>NAME</h1>
                    <h3>POINTS</h3>
                    </div>
        </section>
  


                <div className="secondand3place">

                    <section>
                    <div className="avatar-container">
                    <p>PLACE</p>
                    <img src="public/img/ChibiKitty.png" alt="" />
                    <h1>NAME</h1>
                    <h3> POINTS</h3>
                    </div>
                    </section>

                    <section>
                    <div className="avatar-container">
                    <p>PLACE</p>
                    <img src="public/img/ChibiPanda.png" alt="" />
                    <h1>NAME</h1>
                    <h3> POINTS</h3>
                    </div>
                    </section>
                </div>

            <Link to="/browse">
                <div className="BackCon">
              <button className="BackbuttonEnd" >
                <h4>Back to browse</h4>
              </button>
            </div>
            </Link>

    
    </main>
        



    )

}