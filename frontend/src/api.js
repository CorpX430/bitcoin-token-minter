const API_URL = import.meta.env.VITE_API_URL || "";
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}
export const getTokenInfo = () => request("/api/token-info");
export const getBalance = (address) => request(`/api/balance/${encodeURIComponent(address)}`);
export const mint = (payload) => request("/api/mint", { method: "POST", body: JSON.stringify(payload) });
