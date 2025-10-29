import "./browseani.css";
import ButtonJoinGame from "../components/ButtonJoinGame";
import ThumbnailGrid from "../components/ThumbnailGrid";

export default function Browse() {
  return (
    <main className="flex flex-col items-center browse-background">
      <div className="rulecontainer program-icons reveal stagger">
      <div className="logo">
        <section className="logocon flex flex-col items-center gap-4">
          <img
            src={import.meta.env.BASE_URL + "/img/GameSquareLogo2.svg"}
            alt="GameSquare Logo"
            className="w-80 h-40"
          />
          <h1 className="w-48 h-7 text-center justify-start text-white text-2xl font-medium font-['Inter']">
            Pick your poison
          </h1>
        </section>
      </div>

      {/*Game tiles */}
      <section className="w-96 h-auto flex flex-col gap-8 mb-4">
        <div className="button-container">
          <ButtonJoinGame />
        </div>

        <div>
          <h4 className="w-48 h-7 text-left justify-start text-white text-2xl font-bold font-['Inter']">
            Host a game
          </h4>
        </div>

        {/* Tiles */}
        <ThumbnailGrid />
      </section>
      </div>
    </main>
  );
}
