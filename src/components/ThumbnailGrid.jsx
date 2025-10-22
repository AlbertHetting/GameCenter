import Thumbnails from "./Thumbnails";
import ThumbnailData from "../data/ThumbnailData";

export default function ThumbnailGrid() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {ThumbnailData.map((game, index) => (
        <Thumbnails key={index} game={game} />
      ))}
    </div>
  );
}
