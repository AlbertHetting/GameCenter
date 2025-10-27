import { useNavigate } from "react-router";
import { createRoom } from "/rooms"; // NEW import


export default function Thumbnails({ game }) {
  const navigate = useNavigate();

  async function handleClick() {
    if (game.link === "mystery-bowl") {
      const code = await createRoom();
      navigate(`/room/${code}`);
    } else {
      navigate(`/game/${game.link}`);
    }
  }



  return (
    <button
      className="relative w-96 h-40 rounded-2xl overflow-hidden flex items-center"
      onClick={handleClick}
    >
      {/* Background image */}
      <img
        src={import.meta.env.BASE_URL + game.background}
        alt={game.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Text container */}
      <div className="ml-4 flex flex-col justify-evenly gap-2 relative z-10 text-left">
        <h1 className="text-white text-3xl font-bold font-['Inter']">
          {game.title}
        </h1>

        <div className="w-40 text-white text-base font-semibold font-['Inter']">
          {game.description}
        </div>

        <div className="w-16 h-6 bg-white rounded-xl flex justify-center items-center">
          <div className="flex items-center gap-1">
            <img
              src={import.meta.env.BASE_URL + "/img/icon-persons.svg"}
              alt="Players"
            />
            <p className="text-xs font-bold font-['Inter']">{game.players}</p>
          </div>
        </div>

        <div className="w-20 h-6 bg-white rounded-xl flex justify-center items-center mt-1">
          <div className="flex items-center gap-1">
            <img
              src={import.meta.env.BASE_URL + "/img/icon-timer.svg"}
              alt="Timer"
            />
            <p className="text-xs font-bold font-['Inter']">{game.timer}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
