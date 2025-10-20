export default function Splash() {
  return (
    <main className="bg-[url('/img/Background1.png')] flex flex-col h-screen w-screen justify-start items-center bg-cover bg-center m-0">
      <div className="flex flex-col items-center">
        <img
          className="size-[80vw]"
          src="public/img/GameSquareLogo2.svg"
          alt="GameSquare Logo"
        />
        <h1 className="">Loading...</h1>
      </div>

      <div>
        <img src="public/img/PlayingCards.png" alt="" />
      </div>

      <div>
        <h1>did you know...</h1>
      </div>

      <div className="text-white">
        <h4>®GameSquare 2025</h4>
      </div>
    </main>
  );
}
