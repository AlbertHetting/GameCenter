export default function Method({ data }) {
  if (!data) return null;

  return (
    <div className="max-w-screen flex flex-col items-center gap-4">
      <div className="w-96 h-20 text-center text-white text-base font-medium leading-6 pl-4 pr-4">
        {data.method}
      </div>
    </div>
  );
}