import WordCard from "../components/WordCard";

export default function RoundWinner() {
  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center justify-evenly">
      <div className=" text-white text-4xl font-semibold font-['Poppins'] flex mt-20 justify-center flex-start mt-20">
        <div>
          <p>10</p>
        </div>

        <div>
          <img src="public/img/icon-timer-white.svg" alt="" />
        </div>
      </div>

      <div className="w-96 h-24 text-center justify-start">
        <span class="text-white text-4xl font-semibold font-['Poppins'] leading-[53.99px]">
          The word was{" "}
        </span>
        <span class="text-rose-300 text-4xl font-semibold font-['Poppins'] leading-[53.99px]">
          Obama!
        </span>
      </div>

      {/*Add icon from fastest answer avatar*/}
      <div className="w-60 h-auto mt-[-4rem]">
        <img src="public/img/ChibiCapybara.png" alt="" />
      </div>
      {/*Fastest Avatar Title */}
      <div className="mt-[-4rem]">
        <div className="text-center justify-start text-rose-300 text-4xl font-extrabold font-['Poppins']">
          ALBERT
        </div>
        <div className="text-center justify-start text-white text-4xl font-semibold font-['Poppins'] leading-[53.99px]">
          Was the fastest
        </div>
      </div>

      <div className="w-96 h-6 text-center justify-start text-white text-base font-medium font-['Poppins'] leading-6">
        Gotta go fast! :)
      </div>
    </main>
  );
}
