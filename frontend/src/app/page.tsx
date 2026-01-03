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
   * 単一フィード更新（index 番目だけ再取得して差し替え）
   * - category: "matome" | "tech"
   * - index: フィード配列の何番目を更新するか
   */
  const updateFeed = async (category: FeedCategory, index: number) => {
    // 1) 更新中フラグを追加（UIでボタンを無効にしたりアイコン回転させる）
    setLoadingIds((prev) => [...prev, index]);

    try {
      // 2) APIを叩いて最新のフィードデータを取ってくる
      //    ここで apiUpdateFeed は実際に fetch -> res.json() を返す実装であることが前提
      const updatedFeed = await apiUpdateFeed(category, index);

      // 3) 置換用ヘルパー：不変性を保ちながら配列の index を差し替える
      const replaceFeedAtIndex = (
        feeds: Feed[],
        index: number,
        newFeed: Feed
      ): Feed[] => {
        const updated = [...feeds]; // 元配列をコピー
        updated[index] = newFeed; // 指定indexだけ差し替え
        return updated;
      };

      // 4) カテゴリごとに state を更新（setState の functional update を使って安全に）
      if (category === "matome") {
        setMatomeFeeds((prev) => {
          // 安全策：prev が配列じゃない、または index 範囲外なら何もしない
          if (!Array.isArray(prev) || index < 0 || index >= prev.length) {
            console.warn(
              "updateFeed: invalid index or prev not array",
              index,
              prev
            );
            return prev;
          }
          const newFeeds = replaceFeedAtIndex(prev, index, updatedFeed);
          // 5) キャッシュに保存（ページ遷移や再表示時の高速化のため）
          sessionStorage.setItem("matomeFeeds", JSON.stringify(newFeeds));
          return newFeeds;
        });
      } else {
        setTechFeeds((prev) => {
          if (!Array.isArray(prev) || index < 0 || index >= prev.length) {
            console.warn(
              "updateFeed: invalid index or prev not array",
              index,
              prev
            );
            return prev;
          }
          const newFeeds = replaceFeedAtIndex(prev, index, updatedFeed);
          sessionStorage.setItem("techFeeds", JSON.stringify(newFeeds));
          return newFeeds;
        });
      }
    } catch (err) {
      // 6) エラー時（APIが落ちた・ネットワークなど）はここに来る
      //    ちゃんとログ出しておくとデバッグが楽になる
      console.error("updateFeed failed:", err);
      // （任意）UIでエラーメッセージ出したいならここで state を追加して通知する
    } finally {
      // 7) 必ず更新中フラグを外す（finally でやるのが安全）
      setLoadingIds((prev) => prev.filter((id) => id !== index));
    }
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
      <div className="h-20" />
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
