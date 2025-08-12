// components/FeedCard.tsx

// 更新アイコン用（Heroiconsライブラリ）
import { ArrowPathIcon } from "@heroicons/react/24/solid";

// 日付表示用
import { format, formatDistanceToNow } from "date-fns"; // ← format 追加
import { ja } from "date-fns/locale"; // 日本語ロケール（〜前を日本語で出す）

// RSSアイテム1件分の型定義
type FeedItem = {
  title: string; // 記事タイトル
  link?: string; // 記事URL
  pubDate?: string; // pubDate形式の日付
  isoDate?: string; // ISO形式の日付
};

// フィード（まとめサイト1つ分）の型定義
type Feed = {
  title: string; // サイト名
  items: FeedItem[]; // 記事一覧
  error?: boolean; // エラーがあれば true
};

// コンポーネント本体
export default function FeedCard({
  feed, // サイトのデータ（タイトル＋記事一覧など）
  index, // 親コンポーネント側での順番
  loadingIds, // 現在更新中のindex配列
  onUpdate, // 更新ボタン押したときの処理
}: {
  feed: Feed;
  index: number;
  loadingIds: number[];
  onUpdate: () => void;
}) {
  return (
    <div className="w-[300px] bg-gray-200 rounded-xl border shadow p-4 flex flex-col">
      {/* ヘッダー部分：サイト名と更新ボタン */}
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">{feed.title}</h3>
        <button
          onClick={onUpdate}
          disabled={loadingIds.includes(index)} // 更新中ならボタン無効化
          className="ml-2 p-1 rounded hover:bg-cyan-100 disabled:opacity-50"
          title="更新"
        >
          {/* アイコン（回転アニメーションは更新中のみ） */}
          <ArrowPathIcon
            className={`w-5 h-5 text-cyan-700 ${
              loadingIds.includes(index) ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* フィード取得エラー時 */}
      {feed.error ? (
        <p className="text-red-600">⚠️ 取得に失敗しました</p>
      ) : (
        // 記事リスト
        <ul className="space-y-2 text-sm">
          {feed.items.map((item, idx) => {
            // 日付文字列を取得（pubDate優先、なければisoDate）
            const dateStr = item.pubDate || item.isoDate;
            // 日付オブジェクトに変換（存在しない場合はnull）
            const date = dateStr ? new Date(dateStr) : null;

            return (
              <li key={idx}>
                {/* 投稿日時と相対時間の行 */}
                <span className="flex justify-between text-xs text-gray-500 w-full">
                  {/* 左側：投稿日時（yyyy/MM/dd HH:mm形式） */}
                  <span>
                    {date
                      ? format(date, "yyyy/MM/dd HH:mm") // formatで整形
                      : "日付不明"}
                  </span>

                  {/* 右側：「〜前」 */}
                  <span>
                    {date
                      ? formatDistanceToNow(date, {
                          locale: ja, // 日本語化
                          addSuffix: true, // 「〜前」を付ける
                        })
                      : ""}
                  </span>
                </span>

                {/* タイトルリンク（マウスオーバーで全文ツールチップ表示） */}
                <div className="relative group">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 hover:underline visited:text-purple-500 block truncate max-w-[260px]"
                  >
                    {item.title}
                  </a>
                  {/* ツールチップ */}
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
