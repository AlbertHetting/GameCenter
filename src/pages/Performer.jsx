import WordCard from "../components/WordCard.jsx";

export default function Performer() {
  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center">
      <div className="text-center justify-start text-white text-4xl font-semibold font-['Poppins'] flex mt-20">
        <p>20</p>
        <img className="" src="public/img/icon-timer-white.svg" alt="" />
      </div>

      <div className="w-96 h-14 text-center justify-start text-white text-4xl font-extrabold font-['Poppins'] mt-10">
        Time to pick!
      </div>
      <div className="w-96 h-20 text-center justify-start text-white text-base font-medium font-['Poppins'] leading-6 italic">
        Ready to embarrass yourself?
      </div>

      <div className="w-96 h-20 text-center justify-start text-white text-base font-medium font-['Poppins'] leading-6">
        you have to act out one of the following, sounds are allowed{" "}
      </div>

      {/*Word cards go here*/}
      <div>
        <WordCard />
      </div>
    </main>
  );
}
