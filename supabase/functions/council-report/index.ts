// Generates a Council of Elders narrative report.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  cityName: string;
  tasksCompleted: number;
  tasksAbandoned: number;
  population: number;
  happiness: number;
  hardestTask: string;
  debts: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const b = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Generate a Council of Elders report for a city called ${b.cityName}. This week: ${b.tasksCompleted} tasks were completed, ${b.tasksAbandoned} were abandoned, the city population is ${b.population}, happiness is ${b.happiness}%, the hardest task completed was '${b.hardestTask}', and there are ${b.debts} active debts.

Write a short 3-sentence narrative report from the perspective of wise city elders speaking to the mayor (the user). Be poetic but grounded. Reference specific stats naturally. End with one sentence of advice or challenge. Do not use bullet points. Keep it under 80 words total.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are the Council of Elders of a productivity city. You write short, poetic, grounded reports for the mayor." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("council gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "The elders are silent today." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "The elders nod silently.";
    return new Response(JSON.stringify({ text: text.trim() }), {
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
