import WordCard from "../components/WordCard";

export default function Performer2() {
  return (
    <main className="w-screen h-screen bg-[url(/img/BackgroundPastel.svg)] bg-cover flex flex-col items-center justify-center">
      <div className=" text-white text-4xl font-semibold font-['Poppins'] flex mt-20 justify-center">
        <div>
          <p>90</p>
        </div>

        <div>
          <img src="public/img/icon-timer-white.svg" alt="" />
        </div>
      </div>

      <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 pl-4 pr-4 mt-5">
        you have to act out one of the following <br /> — sounds are allowed:
      </div>

      {/* Random 3 Word Cards */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        {/*Insert Chosen Card from performer 1 here */}
      </div>
    </main>
  );
}
