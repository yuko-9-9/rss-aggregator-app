"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Feed } from "../../../../shared/types";
import { updateFeed as apiUpdateFeed, getFeeds } from "../../lib/api";
import FeedSection from "../components/FeedSection";

export default function MatomePage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  /**
   * フィード取得（キャッシュ保存付き）
   */
  const loadFeeds = async () => {
    setLoading(true);
    try {
      const data = await getFeeds("matome");
      setFeeds(data);
      sessionStorage.setItem("matomeFeeds", JSON.stringify(data)); // キャッシュ保存
    } catch {
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 単一フィード更新
   */
  const updateFeed = async (index: number) => {
    setLoadingIds((prev) => [...prev, index]);
    try {
      const updatedFeed = await apiUpdateFeed("matome", index);

      setFeeds((prev) => {
        const newFeeds = [...prev];
        newFeeds[index] = updatedFeed;
        sessionStorage.setItem("matomeFeeds", JSON.stringify(newFeeds)); // キャッシュ更新
        return newFeeds;
      });
    } catch {
      // エラー時は何もしない
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== index));
    }
  };

  /**
   * 初回マウント時
   */
  useEffect(() => {
    const cache = sessionStorage.getItem("matomeFeeds");
    if (cache) {
      // キャッシュあれば即表示
      setFeeds(JSON.parse(cache));
      setLoading(false);
      // 裏で更新
      loadFeeds();
    } else {
      // キャッシュなければ初回読み込み
      loadFeeds();
    }
  }, []);

  if (loading) {
    return <div className="p-6">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-4xl font-bold mb-10 text-center text-cyan-900">
        📰 情報まとめRSS
      </h1>
      <div className="flex justify-center gap-4 mb-10">
        <Link
          href="/"
          className="inline-block w-40 text-center px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          TOPへ
        </Link>
      </div>
      <FeedSection
        title="まとめ系フィード一覧"
        category="matome"
        feeds={feeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed(index)}
      />
    </div>
  );
}
