// src/CreateProfile.jsx
import { useState} from "react";
import "./profile.css";
import { auth, db } from "/firebaseClient"; // from Step 2
import ButtonSignup from "./ButtonSignup";
import ButtonReturnToLogin from "./ButtonReturnToLogin";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, set, serverTimestamp } from "firebase/database";
import { useNavigate } from "react-router";


export default function CreateProfile() {


// --- Form state: email, username, password ---
const [email, setEmail] = useState("");
const [username, setUsername] = useState("");
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
    // Create user
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set display name
    await updateProfile(cred.user, { displayName: username });

    // Store a tiny profile in Realtime DB
    const { uid } = cred.user;
    await set(ref(db, `users/${uid}`), {
      uid,
      username,
      email,
      createdAt: serverTimestamp(),
    });

    setFormSuccess("Account created!")  

     // ✅ Redirect immediately after successful login
    navigate("/browse");
    
  } catch (err) {
    // Show raw Firebase message for simplicity
    setFormError(err.message || "Something went wrong.");
  }
}

  return (
    <main className="ProfileBackground">
      <section className="logincon">
        <div className="rulecontainer program-icons reveal stagger">
      <div className="logo">
        <section className="logocon">
        <img
          src={import.meta.env.BASE_URL + "/img/GameSquareLogo2.svg"}
          alt="GameSquare Logo"
        />
        <h1>We need to know who you are</h1>
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

        
        <input className="input-area"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
    

        <input
        className="input-area"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
    

        {formError && <p style={{ color: "crimson" }}>{formError}</p>}
        {formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}

      <div className="button-container">
        <ButtonSignup type="submit"/>

        <h4 className="text-center font-semi text-white">Already have a <br /> user?</h4>

        <ButtonReturnToLogin />
      </div>
      </form>

      </div>
      </section>
    </main>
  

);
  
}