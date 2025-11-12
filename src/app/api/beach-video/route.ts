export async function GET(req: Request) {
  // Proxy a video to same-origin to avoid cross-origin blocking.
  // Default to a stable sample video; change to your beach asset as needed.
  const sourceUrl = "https://v.ftcdn.net/03/93/81/51/700_F_393815182_D4hC0U3uTItCtDWCkHIzz3iiKT8Mpm4s_ST.mp4";
  const range = req.headers.get("range");

  const upstream = await fetch(sourceUrl, {
    headers: range ? { Range: range } : undefined,
  });

  const headers = new Headers(upstream.headers);
  headers.set("Content-Type", "video/mp4");
  headers.set("Cache-Control", "public, max-age=86400");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
