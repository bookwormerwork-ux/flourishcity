// Verifies a task completion using before + after photos via Lovable AI Gateway.
// Privacy: photos are processed in-memory only and NEVER stored.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyBody {
  beforeImage: string | null; // optional — null if no before photo was taken
  afterImage: string;
  taskName: string;
  category: string;
  estimatedDurationMinutes: number;
}

const SYSTEM_PROMPT_BEFORE_AFTER = `You are a strict but fair task completion verifier for a productivity app. You will be shown a before photo and an after photo, along with a task description. Your job is to determine if meaningful, real work was done consistent with the task described. Be skeptical of trivial changes. Look for genuine environmental or documentary evidence of effort.

Respond ONLY in this exact JSON format:

{
  "verified": true or false,
  "confidence": "high" | "medium" | "low",
  "message": "A single encouraging or constructive sentence addressed to the user in second person, max 20 words."
}

If the photos appear identical, always return verified: false.`;

const SYSTEM_PROMPT_AFTER_ONLY = `You are a strict but fair task completion verifier for a productivity app. You will be shown a single photo taken after completing a task. Your job is to determine if the photo provides genuine evidence that the described task was completed. Look for real, tangible signs of completion — finished work, a tidy space, relevant output, etc.

Respond ONLY in this exact JSON format:

{
  "verified": true or false,
  "confidence": "high" | "medium" | "low",
  "message": "A single encouraging or constructive sentence addressed to the user in second person, max 20 words."
}

If the photo shows no evidence of the task, return verified: false.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as VerifyBody;
    if (!body.afterImage) {
      return new Response(
        JSON.stringify({
          verified: false,
          confidence: "high",
          message: "An after photo is required to verify your work.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const hasBeforePhoto = !!body.beforeImage;
    const systemPrompt = hasBeforePhoto ? SYSTEM_PROMPT_BEFORE_AFTER : SYSTEM_PROMPT_AFTER_ONLY;
    const userText = hasBeforePhoto
      ? `Task: "${body.taskName}"\nCategory: ${body.category}\nEstimated duration: ${body.estimatedDurationMinutes} min\n\nVerify whether the after photo shows meaningful, genuine progress on the task vs. the before photo. Return ONLY the JSON.`
      : `Task: "${body.taskName}"\nCategory: ${body.category}\nEstimated duration: ${body.estimatedDurationMinutes} min\n\nNo before photo was taken. Verify whether this after photo provides genuine evidence that the task was completed. Return ONLY the JSON.`;

    const imageContent = hasBeforePhoto
      ? [
          { type: "image_url", image_url: { url: body.beforeImage! } },
          { type: "image_url", image_url: { url: body.afterImage } },
        ]
      : [{ type: "image_url", image_url: { url: body.afterImage } }];

    const userMsg = {
      role: "user",
      content: [{ type: "text", text: userText }, ...imageContent],
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          userMsg,
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit reached. Try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add funds to your workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return new Response(
        JSON.stringify({ error: "The council couldn't reach a verdict. Try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    // Try to extract JSON block from the response
    const match = raw.match(/\{[\s\S]*\}/);
    let parsed: { verified: boolean; confidence: string; message: string };
    try {
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {
        verified: false,
        confidence: "low",
        message: "The council couldn't read the evidence. Try again with a clearer photo.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-task error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
