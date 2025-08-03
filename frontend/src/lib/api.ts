export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getFeeds = async (category: "matome" | "tech") => {
  const res = await fetch(`${API_BASE}/feeds/${category}`);
  return res.json();
};

export const updateFeed = async (
  category: "matome" | "tech",
  index: number
) => {
  const res = await fetch(`${API_BASE}/feeds/${category}/${index}`);
  return res.json();
};
console.log("🌐 API_BASE:", API_BASE);
