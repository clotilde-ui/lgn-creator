import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubjectRequest {
  article1Summary: string;
  article2Summary: string;
  article3Summary: string;
  toolSummary: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const { article1Summary, article2Summary, article3Summary, toolSummary }: SubjectRequest = await req.json();

    console.log("Generating subject for newsletter");

    const prompt = `Lis tous les articles de la newsletter :\n\nArticle 1 : ${article1Summary}\n\nArticle 2 : ${article2Summary}\n\nArticle 3 : ${article3Summary}\n\nOutil de la semaine : ${toolSummary}\n\nTrouves un objet putaclic pour la newsletter : court et percutant. Pas d'emoji. Il doit donner envie d'ouvrir le mail. Réponds UNIQUEMENT avec l'objet, sans guillemets ni texte additionnel.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en marketing par email. Tu crées des objets d'emails accrocheurs et percutants qui donnent envie de cliquer."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const subject = data.choices[0].message.content.trim();

    console.log("Generated subject:", subject);

    return new Response(
      JSON.stringify({ success: true, subject }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating subject:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});