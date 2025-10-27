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
    <main className="bg-[url('/img/Background1.png')] flex flex-col h-screen w-screen justify-evenly items-center bg-cover bg-center">
      <div className="flex flex-col items-center mt-[-4rem]">
        <img
          className="size-[80vw]"
          src={import.meta.env.BASE_URL + "/img/GameSquareLogo2.svg"}
          alt="GameSquare Logo"
        />
        <h1 className="text-center justify-start text-white text-2xl font-bold font-['Inter']">
          Loading...
        </h1>
      </div>

      <div>
        <img
          src={import.meta.env.BASE_URL + "/img/PlayingCards.png"}
          alt="Playing cards"
        />
      </div>

      <div>
        <h4 className="text-center justify-start text-white text-2xl font-semi font-['Inter'] italic">
          did you know... <br /> getting points makes you win?
        </h4>
      </div>

      <div className="text-center text-white text-sm font-bold font-['Inter'] mb-[1rem]">
        ®GameSquare 2025
      </div>
    </main>
  );
}
