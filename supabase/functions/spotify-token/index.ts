// Exchange / refresh Spotify OAuth tokens. Public endpoint (no JWT) — secrets stay server-side.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("Spotify credentials not configured");

    const body = await req.json();
    const { action, code, redirect_uri, refresh_token } = body ?? {};

    const params = new URLSearchParams();
    if (action === "exchange") {
      if (!code || !redirect_uri) throw new Error("Missing code or redirect_uri");
      params.set("grant_type", "authorization_code");
      params.set("code", code);
      params.set("redirect_uri", redirect_uri);
    } else if (action === "refresh") {
      if (!refresh_token) throw new Error("Missing refresh_token");
      params.set("grant_type", "refresh_token");
      params.set("refresh_token", refresh_token);
    } else {
      throw new Error("Invalid action");
    }

    const basic = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Spotify token error", data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("spotify-token error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
