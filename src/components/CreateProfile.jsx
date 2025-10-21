import ButtonSignup from "./ButtonSignup";
export default function CreateProfile() {
  return (
    <main className="bg-[url('/img/Background1.png')] flex flex-col h-screen w-screen justify-around items-center bg-cover bg-center">
      <div className="flex flex-col items-center">
        <img
          className="size-[80vw]"
          src="/img/GameSquareLogo2.svg"
          alt="GameSquare Logo"
        />
        <h1>We need to know who you are!</h1>
      </div>

      {/*Forms */}
      <div></div>

      {/*Buttons */}
      <div>
        <ButtonSignup />
      </div>

      <div>
        <h1>Did you know...</h1>
      </div>

      <div className="text-center text-white text-sm font-bold font-['Inter']">
        ®GameSquare 2025
      </div>
    </main>
  );
}
