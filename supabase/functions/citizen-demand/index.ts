// Generates a single short citizen demand line.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  recentTasks: { title: string; category: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const b = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const list = b.recentTasks
      .map((t) => `- ${t.title} (${t.category})`)
      .join("\n");

    const userPrompt = `A city's citizens need more variety. Recent tasks were:
${list}

Generate one short citizen demand (max 12 words) asking for a different type of task. Be playful and specific. Example: 'The scholars demand a study session! The library grows dusty.'`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You write short, playful citizen demands for a productivity city game. Output ONE sentence only, no quotes, max 12 words." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("citizen gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Citizens are quiet." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    let text: string = data?.choices?.[0]?.message?.content ?? "Citizens want variety.";
    text = text.trim().replace(/^["']|["']$/g, "");
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
