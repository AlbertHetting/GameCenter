import WordCardData from "../data/WordCardData";
import WordCard from "./WordCard";

export default function ThumbnailGrid() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {WordCardData.map((data, index) => (
        <WordCard key={index} data={data} />
      ))}
    </div>
  );
}
