import type { Feed } from "../../../../shared/types";
import FeedCard from "./FeedCard";

type FeedSectionProps = {
  title: string;
  feeds: Feed[];
  loadingIds: number[];
  onUpdate: (index: number) => void;
  className?: string;
};

export default function FeedSection({
  title,
  feeds,
  loadingIds,
  onUpdate,
  className,
}: FeedSectionProps) {
  return (
    <>
      <div className="mb-6 border-b-2 border-cyan-600">
        <h2 className="text-2xl font-semibold text-cyan-700">{title}</h2>
      </div>
      <div className={`flex flex-wrap justify-center gap-6 ${className ?? ""}`}>
        {feeds.map((feed, i) => (
          <FeedCard
            key={`${title}-${i}`}
            feed={feed}
            index={i}
            loadingIds={loadingIds}
            onUpdate={() => onUpdate(i)}
          />
        ))}
      </div>
    </>
  );
}
