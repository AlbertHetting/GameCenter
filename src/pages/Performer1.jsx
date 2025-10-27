import { useMemo } from "react";
import WordCard from "../components/WordCard";
import WordCardData from "../data/WordCardData";

export default function Performer1() {
  // Pick 3 random cards once per component mount
  const randomCards = useMemo(() => {
    const shuffled = [...WordCardData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center pt-[-4rem] pb-[4rem]">
      <div className=" text-white text-4xl font-semibold font-['Poppins'] flex mt-20 justify-center">
        <div>
          <p>20</p>
        </div>

        <div>
          <img src="public/img/icon-timer-white.svg" alt="" />
        </div>
      </div>

      <div className="w-96 h-14 text-center text-white text-4xl font-extrabold mt-10">
        Time to pick!
      </div>

      <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 italic">
        Ready to embarrass yourself?
      </div>

      <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 pl-4 pr-4">
        you have to act out one of the following <br /> — sounds are allowed:
      </div>

      {/* Random 3 Word Cards */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        {randomCards.map((data, index) => (
          <WordCard key={index} data={data} />
        ))}
      </div>
    </main>
  );
}
