export default function WordCard({ data }) {
  return (
    <main className="max-w-screen flex flex-col items-center gap-4 ">
      <div className="w-96 h-auto pl-8 pr-8 ">
        {/* Text container */}
        <div className="ml-0 flex flex-col justify-evenly gap-2 relative z-10 text-left">
          <h1 className="text-rose-300 text-base font-medium font-['Poppins'] leading-6">
            {data.title}
          </h1>
        </div>

        <div className="w-auto h-[6rem] bg-rose-300 rounded-xl flex items-center justify-center">
          <h1 className="text-white text-4xl font-medium font-['Poppins']">
            {data.word}
          </h1>
        </div>
      </div>
    </main>
  );
}
