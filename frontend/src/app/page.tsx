"use client"; // クライアントコンポーネント宣言

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Feed } from "../../../shared/types";
import { updateFeed as apiUpdateFeed, getFeeds } from "../lib/api";
import FeedSection from "./components/FeedSection";

// カテゴリ型
type FeedCategory = "matome" | "tech";

export default function HomePage() {
  // 各カテゴリのフィード
  const [matomeFeeds, setMatomeFeeds] = useState<Feed[]>([]);
  const [techFeeds, setTechFeeds] = useState<Feed[]>([]);

  // ローディング状態
  const [loadingMatome, setLoadingMatome] = useState(true);
  const [loadingTech, setLoadingTech] = useState(true);

  // 更新中のインデックス
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  /**
   * 共通フィード取得
   */
  const loadFeeds = async (
    category: FeedCategory,
    setFeeds: React.Dispatch<React.SetStateAction<Feed[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoading(true);
    try {
      const data = await getFeeds(category);
      setFeeds(data);
      // キャッシュ保存
      sessionStorage.setItem(`${category}Feeds`, JSON.stringify(data));
      return data;
    } catch {
      setFeeds([]);
      return [];
    } finally {
      setLoading(false); // 必ず解除
    }
  };

  /**
   * 単一フィード更新
   */
  const updateFeed = async (category: FeedCategory, index: number) => {
    setLoadingIds((prev) => [...prev, index]);
    try {
      const updatedFeed = await apiUpdateFeed(category, index);

      const replaceFeedAtIndex = (
        feeds: Feed[],
        index: number,
        newFeed: Feed
      ): Feed[] => {
        const updated = [...feeds];
        updated[index] = newFeed;
        return updated;
      };

      if (category === "matome") {
        setMatomeFeeds((prev) => {
          const newFeeds = replaceFeedAtIndex(prev, index, updatedFeed);
          sessionStorage.setItem("matomeFeeds", JSON.stringify(newFeeds));
          return newFeeds;
        });
      } else {
        setTechFeeds((prev) => {
          const newFeeds = replaceFeedAtIndex(prev, index, updatedFeed);
          sessionStorage.setItem("techFeeds", JSON.stringify(newFeeds));
          return newFeeds;
        });
      }
    } catch {
      // エラーは無視
    }
    setLoadingIds((prev) => prev.filter((id) => id !== index));
  };

  /**
   * 初回マウント時処理
   */
  useEffect(() => {
    // キャッシュ読み込み
    const matomeCache = sessionStorage.getItem("matomeFeeds");
    const techCache = sessionStorage.getItem("techFeeds");

    if (matomeCache) {
      setMatomeFeeds(JSON.parse(matomeCache));
      setLoadingMatome(false);
    } else {
      loadFeeds("matome", setMatomeFeeds, setLoadingMatome);
    }

    if (techCache) {
      setTechFeeds(JSON.parse(techCache));
      setLoadingTech(false);
    } else {
      loadFeeds("tech", setTechFeeds, setLoadingTech);
    }
  }, []);

  // ローディング中（両方とも）なら表示
  if (loadingMatome && loadingTech) {
    return <div className="p-6">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-10 text-center text-cyan-900">
        📰 情報まとめRSS
      </h1>
      {/* ページ遷移リンク（共通スタイルにする） */}
      <div className="flex justify-center gap-4 mb-10">
        <Link
          href="/matome"
          className="inline-block w-60 text-center px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          まとめ系フィードへ
        </Link>
        <Link
          href="/tech"
          className="inline-block w-60 text-center px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Tech系フィードへ
        </Link>
      </div>

      {/* まとめ系フィード一覧 */}
      <FeedSection
        title="まとめ系フィード一覧"
        feeds={matomeFeeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed("matome", index)}
      />

      {/* Tech系フィード一覧 */}
      <FeedSection
        title="Tech系フィード一覧"
        feeds={techFeeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed("tech", index)}
      />
    </div>
  );
}
