// 環境変数から API のベースURLを取得
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// 一覧を取得する関数
// category は "matome" か "tech" だけを許可
export const getFeeds = async (category: "matome" | "tech") => {
  const res = await fetch(`${API_BASE}/feeds/${category}`);
  return res.json();
};

// フィードを更新するAPI
// ※ index を URL に渡してるので、ID的な扱い
export const updateFeed = async (
  category: "matome" | "tech",
  index: number
) => {
  const res = await fetch(`${API_BASE}/feeds/${category}/${index}`);
  return res.json();
};

// フィード詳細を取得する関数
export const getFeedDetail = async (
  category: "matome" | "tech",
  index: number
) => {
  const res = await fetch(`${API_BASE}/feeds/${category}/${index}/detail`);

  // ステータスが 200系じゃなかったらエラーにする
  if (!res.ok) throw new Error("Failed to fetch feed detail");
  return res.json();
};

// 環境変数がちゃんと読めてるかのデバッグ用
console.log("🌐 API_BASE:", API_BASE);
