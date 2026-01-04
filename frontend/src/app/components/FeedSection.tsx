import { useState } from "react";
import type { Feed } from "../../../../shared/types";
import FeedCard from "./FeedCard";

type FeedSectionProps = {
  title: string;
  category: "matome" | "tech";
  feeds: Feed[];
  loadingIds: number[];
  onUpdate: (index: number) => void;
  className?: string;
};

export default function FeedSection({
  title,
  category,
  feeds,
  loadingIds,
  onUpdate,
  className,
}: FeedSectionProps) {
  // アコーディオンの開閉状態
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* タイトル（クリックで開閉） */}
      <div
        className="mt-10 mb-6 border-b-2 border-cyan-600 cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-cyan-700">{title}</h2>
          <span className="text-cyan-700 text-xl">{isOpen ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* 中身（開いてる時だけ表示） */}
      {isOpen && (
        <div
          className={`flex flex-wrap justify-center gap-6 ${className ?? ""}`}
        >
          {feeds.map((feed, i) => (
            <FeedCard
              key={`${title}-${i}`}
              feed={feed}
              index={i}
              category={category}
              loadingIds={loadingIds}
              onUpdate={() => onUpdate(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}
