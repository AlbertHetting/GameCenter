import "./Guide.css";
import { Link } from "react-router";

export default function QuickGuide(){
    return(
          
       <main className="GuideBackground" >
        <article>
            <div className="rulecontainer program-icons reveal stagger">
        <section>

      
        
        <div className="conceptheader">
        <div className="conceptcon" >
        <img className="Concept" src={import.meta.env.BASE_URL + "/img/Concept.png"} alt="" />
        </div>

        <div className="textcon">
        <h1>Games have rules here's how to play!</h1>
        </div>
        </div>
        <div className="rulecontainer">

        <section className="numberrule">
        <div className="circle1">
            <h2>1</h2>
        </div>
        <div className="step1">
            <h3>Pick the game you want to play</h3>
        </div>
        </section>

                <section className="numberrule">
        <div className="circle1">
            <h2>2</h2>
        </div>
        <div className="step1">
            <h3>Friends join via lobby code displayed</h3>
        </div>
        </section>

                <section className="numberrule">
        <div className="circle1">
            <h2>3</h2>
        </div>
        <div className="step1">
            <h3>Tutorial video plays to explain the rules</h3>
        </div>
        </section>

                <section className="numberrule">
        <div className="circle1">
            <h2>4</h2>
        </div>
        <div className="step1">
            <h3>Enjoy the game experience!</h3>
        </div>
        
        </section>

        </div>


            <div className="continuecon">
            <Link to="/profile" className="continuebutton">
                <h4>Got It!</h4>
            </Link>
            </div>
        </section>
        </div>
        </article>
        </main>
    
    )
}