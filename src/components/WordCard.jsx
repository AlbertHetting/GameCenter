export default function WordCard({ data }) {
  return (
    <div>
      {/* Text container */}
      <div className="ml-4 flex flex-col justify-evenly gap-2 relative z-10 text-left">
        <h1 className="text-white text-3xl font-bold font-['Inter']">
          {data.title}
        </h1>
      </div>

      <div className="w-40 text-white text-base font-semibold font-['Inter']">
        {data.description}
      </div>
    </div>
  );
}
