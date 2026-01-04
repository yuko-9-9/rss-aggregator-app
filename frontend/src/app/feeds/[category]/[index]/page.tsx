"use client";

import { getFeedDetail } from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Feed } from "../../../../../../shared/types";

export default function FeedDetailPage() {
  // =====================================
  // URLパラメータ取得
  // /feeds/[category]/[index]
  // =====================================
  const params = useParams<{
    category: "matome" | "tech";
    index: string;
  }>();
  const router = useRouter();

  const { category, index } = params;

  // =====================================
  // state管理
  // =====================================

  // フィード本体（取得できるまで null）
  const [feed, setFeed] = useState<Feed | null>(null);

  // ローディング状態
  const [loading, setLoading] = useState(true);

  // =====================================
  // 初回マウント時に backend API を叩く
  // =====================================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        /**
         * index は URL 由来なので string
         * backend 側は number 前提なので Number に変換
         */
        const data = await getFeedDetail(category, Number(index));

        // 正常取得できたら state にセット
        setFeed(data);
      } catch (e) {
        // 取得失敗時（ネットワーク or backend エラー）
        console.error("フィード取得失敗", e);
      } finally {
        // 成否に関わらず loading は false
        setLoading(false);
      }
    };

    fetchDetail();
  }, [category, index]);

  // =====================================
  // 表示分岐
  // =====================================

  // 読み込み中
  if (loading) {
    return <div className="p-6">読み込み中...</div>;
  }

  // データが取得できなかった場合
  if (!feed) {
    return <div className="p-6">データが見つかりません</div>;
  }

  // =====================================
  // 通常表示
  // =====================================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* サイト名 */}
      <h1 className="text-2xl font-bold mb-1 text-gray-900">{feed.title}</h1>

      {/* 件数表示 */}
      <p className="text-sm text-gray-500 mb-4">最新 {feed.items.length} 件</p>

      <ul className="space-y-4">
        {feed.items.map((item, i) => {
          /**
           * pubDate or isoDate を Date に変換
           * RSSによってフィールド名が違うので両対応
           */
          const dateStr = item.pubDate || item.isoDate;
          const date = dateStr ? new Date(dateStr) : null;

          return (
            <li key={i} className="bg-white rounded-lg border p-4 shadow-sm">
              {/* 投稿日時 */}
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                {/* 左：日時 */}
                <span>
                  {date ? format(date, "yyyy/MM/dd HH:mm") : "日付不明"}
                </span>

                {/* 右：◯時間前 */}
                <span>
                  {date
                    ? formatDistanceToNow(date, {
                        locale: ja,
                        addSuffix: true,
                      })
                    : ""}
                </span>
              </div>

              {/* 記事タイトル */}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-800 font-medium hover:underline"
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>

      {/* 戻るボタン（右下フロート・アイコン風） */}
      <button
        onClick={() => router.back()}
        className="
          fixed
          bottom-6
          right-6
          z-50
          w-11
          h-11
          flex
          items-center
          justify-center
          rounded-full
          border
          bg-cyan-600
          text-white
          shadow-md
          hover:bg-gray-100
        "
        aria-label="戻る"
      >
        ←
      </button>
    </div>
  );
}
