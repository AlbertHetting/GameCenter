import { useState } from "react";
import "./profile.css";
import { auth } from "/firebaseClient"; // from Step 2
import ButtonReturnToSignup from "./ButtonReturnToSignup";
import ButtonLogin from "./ButtonLogin";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router";




export default function LoginProfile() {


// --- Form state: email, username, password ---
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

// --- Feedback (optional but helpful) ---
const [formError, setFormError] = useState("");
const [formSuccess, setFormSuccess] = useState("");

const navigate = useNavigate();


async function onSubmit(e) {
  e.preventDefault();
  setFormError("");
  setFormSuccess("");

  try {
    // Sign in the user
    await signInWithEmailAndPassword(auth, email, password);

    setFormSuccess("Logged in! Redirecting...");

    // ✅ Redirect immediately after successful login
    navigate("/browse");

  } catch (err) {
    // Show raw Firebase message for simplicity
    setFormError(err.message || "Login failed. Check your email or password and try again.");
  }
}

  return (
    <main className="ProfileBackground" >
      <section className="logincon">
      <div className="rulecontainer program-icons reveal stagger">
      <div className="logo">
        <section className="logocon">
        <img
          src="/img/GameSquareLogo2.svg"
          alt="GameSquare Logo"
        />
        <h1>You seem familiar - welcome back!</h1>
        </section>
      </div>
      
      <form  onSubmit={onSubmit} noValidate>
        <div className="form-email">
        <input className="input-area"
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      
        </div>
    

        <input
        className="input-area"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
    

        {formError && <p style={{ color: "#f03f59" }}>{formError}</p>}
        {formSuccess && <p style={{ color: "#affc41" }}>{formSuccess}</p>}

<div className="button-container">
    <ButtonLogin />
        

        <h4 className="text-center font-semi text-white">Don't have a <br /> user?</h4>
    <ButtonReturnToSignup type="submit"/>
        
      </div>
      </form>

      </div>
      </section>
    </main>
  

);
  
}