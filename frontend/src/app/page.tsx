"use client"; // このファイルがクライアントコンポーネントであることを宣言（Next.jsのルール）

import Link from "next/link"; // ページ遷移リンク
import { useEffect, useState } from "react"; // Reactの状態・副作用フック
import type { Feed } from "../../../shared/types"; // Feed型を共通typesからimport
import FeedSection from "./components/FeedSection"; // 共通化したフィード表示UIコンポーネント

export default function HomePage() {
  // 各カテゴリごとのフィード状態管理
  const [matomeFeeds, setMatomeFeeds] = useState<Feed[]>([]);
  const [techFeeds, setTechFeeds] = useState<Feed[]>([]);

  // ローディング状態
  const [loadingMatome, setLoadingMatome] = useState(true);
  const [loadingTech, setLoadingTech] = useState(true);

  // 特定インデックスの更新中かを記録する（スピナー用）
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  // カテゴリ文字列の型を明示
  type FeedCategory = "matome" | "tech";

  /**
   * フィード取得共通関数（matome/tech兼用）
   * @param category 取得対象カテゴリ
   * @param setFeeds 状態更新関数
   * @param setLoading ローディング更新関数
   */
  const loadFeeds = async (
    category: FeedCategory,
    setFeeds: React.Dispatch<React.SetStateAction<Feed[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoading(true); // ローディングON
    try {
      const res = await fetch(`http://localhost:34567/feeds/${category}`);
      const data = await res.json();
      setFeeds(data); // 成功したらデータセット
    } catch {
      setFeeds([]); // 失敗時は空配列
    } finally {
      setLoading(false); // ローディングOFF
    }
  };

  /**
   * 単一フィード更新処理（特定インデックスのみ）
   * @param category まとめ or tech
   * @param index 対象のフィード位置
   */
  const updateFeed = async (category: FeedCategory, index: number) => {
    setLoadingIds((prev) => [...prev, index]); // 該当インデックスを「更新中」に追加

    try {
      const res = await fetch(
        `http://localhost:34567/feeds/${category}/${index}`
      );
      if (!res.ok) throw new Error("Failed to fetch feed");
      const updatedFeed = await res.json();

      // 配列の中身をindex指定で差し替える共通関数
      const replaceFeedAtIndex = (
        feeds: Feed[],
        index: number,
        newFeed: Feed
      ): Feed[] => {
        const updated = [...feeds]; // 新しい配列を作る（破壊的でない）
        updated[index] = newFeed;
        return updated;
      };

      // カテゴリに応じて該当フィード状態を更新
      if (category === "matome") {
        setMatomeFeeds((prev) => replaceFeedAtIndex(prev, index, updatedFeed));
      } else {
        setTechFeeds((prev) => replaceFeedAtIndex(prev, index, updatedFeed));
      }
    } catch {
      // エラー処理はとりあえずスルーでOK
    }

    setLoadingIds((prev) => prev.filter((id) => id !== index)); // 更新完了としてIDを除去
  };

  // 初回マウント時に両方のカテゴリを読み込む
  useEffect(() => {
    loadFeeds("matome", setMatomeFeeds, setLoadingMatome);
    loadFeeds("tech", setTechFeeds, setLoadingTech);
  }, []);

  // どっちかローディング中なら「読み込み中」を表示
  if (loadingMatome || loadingTech)
    return <div className="p-6">読み込み中...</div>;

  // ここからUI描画部
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-6 text-center text-cyan-900">
        📰 情報まとめRSS
      </h1>

      {/* ページリンクボタン */}
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

      {/* フィード一覧（まとめ） */}
      <FeedSection
        title="まとめ系フィード一覧"
        feeds={matomeFeeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed("matome", index)}
      />

      {/* フィード一覧（Tech） */}
      <FeedSection
        title="Tech系フィード一覧"
        feeds={techFeeds}
        loadingIds={loadingIds}
        onUpdate={(index) => updateFeed("tech", index)}
      />
    </div>
  );
}
