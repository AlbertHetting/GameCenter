import { useNavigate } from "react-router";
export default function ButtonJoinGame( {onClick} ) {
  const navigate = useNavigate(); // Navigation hook

  function handleClick() {
    navigate("/join");
  }
 

  // Rendered Components
  return (
    <button
      onClick={handleClick}
      className="flex w-[100%] h-24 bg-black/50 mix-blend-overlay rounded-2xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] items-center justify-center hover:bg-black/70 transition-colors"
    >
      <div className="flex gap-4 items-center">
        <h1 className="text-white text-4xl font-medium font-['Inter']">
          Join Game
        </h1>
        <img
          src={import.meta.env.BASE_URL + "/img/arrow-right-white.svg"}
          alt="white arrow pointing right"
        />
      </div>
    </button>
  );
}
