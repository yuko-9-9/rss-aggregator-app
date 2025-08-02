// components/FeedCard.tsx
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

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

export default function FeedCard({
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
            const dateStr = item.pubDate || item.isoDate;
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
