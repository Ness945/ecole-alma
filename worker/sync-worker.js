// Cloudflare Worker + KV : stocke un blob chiffré par identifiant opaque. Ne voit jamais de données en clair.
// Liaison KV attendue : SYNC. Variable facultative ALLOW_ORIGIN (ex. https://ness945.github.io).
const MAX = 400000;
export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    };
    const send = (obj, status = 200) =>
      new Response(obj === null ? null : JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    if (req.method === "OPTIONS") return send(null, 204);
    const m = new URL(req.url).pathname.match(/^\/v1\/([0-9a-f]{64})$/);
    if (!m) return send({ error: "not found" }, 404);
    const key = m[1];
    const current = JSON.parse((await env.SYNC.get(key)) || "null");
    if (req.method === "GET") return current ? send(current) : send({ error: "empty" }, 404);
    if (req.method !== "PUT") return send({ error: "method" }, 405);
    const text = await req.text();
    if (text.length > MAX) return send({ error: "too large" }, 413);
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return send({ error: "json" }, 400);
    }
    if (typeof body.data !== "string" || !/^[A-Za-z0-9+/=]+$/.test(body.data) || !Number.isInteger(body.base))
      return send({ error: "format" }, 400);
    if ((current?.rev || 0) !== body.base) return send({ error: "conflict" }, 409);
    const next = { rev: body.base + 1, data: body.data };
    await env.SYNC.put(key, JSON.stringify(next));
    return send({ rev: next.rev });
  },
};
