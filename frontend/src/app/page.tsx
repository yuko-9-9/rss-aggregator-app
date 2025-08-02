"use client";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";

type FeedItem = {
  title: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
};

type Feed = {
  title: string;
  items: FeedItem[];
  error?: boolean;
};

export default function HomePage() {
  const [matomeFeeds, setMatomeFeeds] = useState<Feed[]>([]);
  const [techFeeds, setTechFeeds] = useState<Feed[]>([]);
  const [loadingMatome, setLoadingMatome] = useState(true);
  const [loadingTech, setLoadingTech] = useState(true);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  // まとめ系フィード読み込み
  const loadMatomeFeeds = () => {
    setLoadingMatome(true);
    fetch("http://localhost:34567/feeds/matome")
      .then((res) => res.json())
      .then((data) => {
        setMatomeFeeds(data);
        setLoadingMatome(false);
      })
      .catch(() => {
        setMatomeFeeds([]);
        setLoadingMatome(false);
      });
  };

  // tech系フィード読み込み
  const loadTechFeeds = () => {
    setLoadingTech(true);
    fetch("http://localhost:34567/feeds/tech")
      .then((res) => res.json())
      .then((data) => {
        setTechFeeds(data);
        setLoadingTech(false);
      })
      .catch(() => {
        setTechFeeds([]);
        setLoadingTech(false);
      });
  };

  // 個別更新（まとめ優先で実装例）
  const updateFeed = async (category: "matome" | "tech", index: number) => {
    setLoadingIds((prev) => [...prev, index]);
    try {
      const res = await fetch(
        `http://localhost:34567/feeds/${category}/${index}`
      );
      if (!res.ok) throw new Error("Failed to fetch feed");
      const updatedFeed = await res.json();

      if (category === "matome") {
        setMatomeFeeds((prev) => {
          const newFeeds = [...prev];
          newFeeds[index] = updatedFeed;
          return newFeeds;
        });
      } else {
        setTechFeeds((prev) => {
          const newFeeds = [...prev];
          newFeeds[index] = updatedFeed;
          return newFeeds;
        });
      }
    } catch {
      // エラーは何もしないでOK
    }
    setLoadingIds((prev) => prev.filter((id) => id !== index));
  };

  useEffect(() => {
    loadMatomeFeeds();
    loadTechFeeds();
  }, []);

  if (loadingMatome || loadingTech)
    return <div className="p-6">読み込み中...</div>;

  // まとめ系 or tech系で表示分ける小コンポーネント作ってもいいけど
  // とりあえずひとつのページに両方表示するならこうやで

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-cyan-900">
        📰 情報まとめRSS
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <Link
          href="/matome"
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          まとめ系フィードへ
        </Link>
        <Link
          href="/tech"
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Tech系フィードへ
        </Link>
      </div>

      {/* まとめ系タイトル */}
      <div className="mb-6 border-b-2 border-cyan-600">
        <h2 className="text-2xl font-semibold text-cyan-700">
          まとめ系フィード一覧
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {matomeFeeds.map((feed, i) => (
          <FeedCard
            key={`matome-${i}`}
            feed={feed}
            index={i}
            loadingIds={loadingIds}
            onUpdate={() => updateFeed("matome", i)}
          />
        ))}
      </div>

      {/* tech系タイトル */}
      <div className="mb-6 border-b-2 border-cyan-600">
        <h2 className="text-2xl font-semibold text-cyan-700">
          プログラミング系フィード一覧
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {techFeeds.map((feed, i) => (
          <FeedCard
            key={`tech-${i}`}
            feed={feed}
            index={i}
            loadingIds={loadingIds}
            onUpdate={() => updateFeed("tech", i)}
          />
        ))}
      </div>
    </div>
  );
}

// Feedカードはコンポーネントに分けてスッキリさせる
function FeedCard({
  feed,
  index,
  loadingIds,
  onUpdate,
}: {
  feed: Feed;
  index: number;
  loadingIds: number[];
  onUpdate: () => void;
}) {
  return (
    <div className="w-[300px] bg-white rounded-xl border shadow p-4 flex flex-col">
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">{feed.title}</h3>
        <button
          onClick={onUpdate}
          disabled={loadingIds.includes(index)}
          className="ml-2 p-1 rounded hover:bg-cyan-100 disabled:opacity-50"
          title="更新"
        >
          <ArrowPathIcon
            className={`w-5 h-5 text-cyan-700 ${
              loadingIds.includes(index) ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {feed.error ? (
        <p className="text-red-600">⚠️ 取得に失敗しました</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {feed.items.map((item, idx) => {
            const dateStr = item.pubDate || (item as any).isoDate;
            const date = dateStr ? new Date(dateStr) : null;

            return (
              <li key={idx}>
                <span className="flex justify-between text-xs text-gray-500 w-full">
                  <span>{date ? date.toLocaleDateString() : "日付不明"}</span>
                  <span>
                    {date
                      ? formatDistanceToNow(date, {
                          locale: ja,
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </span>

                <div className="relative group">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline block truncate max-w-[260px]"
                  >
                    {item.title}
                  </a>
                  <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 left-0 top-full mt-1 w-max max-w-xs whitespace-normal break-words shadow-lg">
                    {item.title}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
