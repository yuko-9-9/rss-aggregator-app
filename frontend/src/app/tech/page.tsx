"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Feed } from "../../../../shared/types";
import FeedSection from "../components/FeedSection";

export default function TechPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const loadFeeds = () => {
    setLoading(true);
    fetch("http://localhost:34567/feeds/tech") // APIでtech用を用意する想定
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

  const updateFeed = async (index: number) => {
    setLoadingIds((prev) => [...prev, index]);
    try {
      const res = await fetch(`http://localhost:34567/feeds/tech/${index}`);
      if (!res.ok) throw new Error("Failed to fetch feed");
      const updatedFeed = await res.json();
      setFeeds((prevFeeds) => {
        const newFeeds = [...prevFeeds];
        newFeeds[index] = updatedFeed;
        return newFeeds;
      });
    } catch {
      // エラー処理
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
      <div className="flex justify-center gap-4 mb-10">
        <Link
          href="/"
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          TOPへ
        </Link>
      </div>
      <FeedSection
        title="tech系フィード一覧"
        feeds={feeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed(index)}
      />
    </div>
  );
}
