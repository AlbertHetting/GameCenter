// src/pages/Splash.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Splash() {
  const navigate = useNavigate();

  /*  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/guide"); // redirect after loading
    }, 10000); // show splash for 2s

    return () => clearTimeout(timer);
  }, [navigate]); */

  return (
    <main className="bg-[url('/img/Background1.png')] flex flex-col h-screen w-screen justify-around items-center bg-cover bg-center">
      <div className="flex flex-col items-center">
        <img
          className="size-[80vw]"
          src="/img/GameSquareLogo2.svg"
          alt="GameSquare Logo"
        />
        <h1>Loading...</h1>
      </div>

      <div>
        <img src="/img/PlayingCards.png" alt="Playing cards" />
      </div>

      <div>
        <h1>Did you know...</h1>
      </div>

      <div className="mt-auto text-center text-white text-sm font-bold font-['Inter']">
        ®GameSquare 2025
      </div>
    </main>
  );
}
