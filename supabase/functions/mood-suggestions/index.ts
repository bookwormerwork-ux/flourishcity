// Generates 3 right-sized task suggestions for the user's current mood.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["work", "study", "health", "home", "creative", "growth", "social", "finance"];

interface Body {
  mood: "energized" | "okay" | "tired" | "stressed";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mood } = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sys = `You are a productivity coach. Suggest exactly 3 small, achievable tasks tailored to the user's current mood. Tasks must match the mood's energy level — never suggest hard work to a tired user. Output STRICT JSON ONLY in this shape:
{"suggestions":[{"title":"...","category":"work|study|health|home|creative|growth|social|finance","durationMinutes":10}]}
durationMinutes must be 5..60. No extra text.`;

    const user = `Current mood: ${mood}. Give 3 tasks.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("mood gateway error", resp.status, t);
      return new Response(JSON.stringify({ suggestions: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    let suggestions: unknown = [];
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        suggestions = parsed.suggestions ?? [];
      } catch {
        suggestions = [];
      }
    }
    // Sanitize
    const clean = (Array.isArray(suggestions) ? suggestions : [])
      .filter((s): s is { title: string; category: string; durationMinutes: number } =>
        !!s && typeof (s as { title?: unknown }).title === "string" &&
        typeof (s as { category?: unknown }).category === "string" &&
        typeof (s as { durationMinutes?: unknown }).durationMinutes === "number"
      )
      .map((s) => ({
        title: s.title.slice(0, 80),
        category: CATEGORIES.includes(s.category) ? s.category : "growth",
        durationMinutes: Math.max(5, Math.min(60, Math.round(s.durationMinutes))),
      }))
      .slice(0, 3);

    return new Response(JSON.stringify({ suggestions: clean }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
