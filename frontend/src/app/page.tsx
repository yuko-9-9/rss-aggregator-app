"use client";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useState } from "react";

type FeedItem = {
  title: string;
  link?: string;
  pubDate?: string;
};

type Feed = {
  title: string;
  items: FeedItem[];
  error?: boolean;
};

export default function HomePage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<number[]>([]); // 更新中のID管理用

  const loadFeeds = () => {
    setLoading(true);
    fetch("http://localhost:34567/feeds")
      .then((res) => res.json())
      .then((data) => {
        setFeeds(data);
        setLoading(false);
      })
      .catch(() => {
        setFeeds([]);
        setLoading(false);
      });
  };

  // 個別フィード更新
  const updateFeed = async (index: number) => {
    setLoadingIds((prev) => [...prev, index]);
    try {
      const res = await fetch(`http://localhost:34567/feeds/${index}`);
      if (!res.ok) throw new Error("Failed to fetch feed");
      const updatedFeed = await res.json();
      setFeeds((prevFeeds) => {
        const newFeeds = [...prevFeeds];
        newFeeds[index] = updatedFeed;
        return newFeeds;
      });
    } catch {
      // エラー時は何もしない or エラー表示用の処理を入れてもOK
    }
    setLoadingIds((prev) => prev.filter((id) => id !== index));
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-4xl font-bold mb-10 text-center text-cyan-900">
        📰 情報まとめRSS
      </h1>

      <div className="flex flex-wrap justify-center gap-6">
        {feeds.map((feed, i) => (
          <div
            key={i}
            className="w-[300px] bg-white rounded-xl border shadow p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {feed.title}
              </h2>
              <button
                onClick={() => updateFeed(i)}
                disabled={loadingIds.includes(i)}
                className="ml-2 p-1 rounded hover:bg-cyan-100 disabled:opacity-50"
                title="更新"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 text-cyan-700 ${
                    loadingIds.includes(i) ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            {feed.error ? (
              <p className="text-red-600">⚠️ 取得に失敗しました</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {feed.items.map((item, idx) => (
                  <li key={idx}>
                    <span className="flex justify-between text-xs text-gray-500 w-full">
                      <span>
                        {item.pubDate
                          ? new Date(item.pubDate).toLocaleDateString()
                          : ""}
                      </span>
                      <span>
                        {item.pubDate
                          ? formatDistanceToNow(new Date(item.pubDate), {
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
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
