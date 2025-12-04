import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CampaignRequest {
  htmlContent: string;
  campaignNumber: string;
  subject?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const brevoListId = Deno.env.get("BREVO_LIST_ID");

    console.log("Edge function called, API key present:", !!brevoApiKey, "List ID present:", !!brevoListId);

    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    if (!brevoListId) {
      throw new Error("BREVO_LIST_ID not configured. Please add your Brevo list ID to the environment variables.");
    }

    const { htmlContent, campaignNumber, subject }: CampaignRequest = await req.json();

    console.log("Request received:", { campaignNumber, subject, htmlLength: htmlContent?.length });

    if (!subject || subject.trim() === "") {
      throw new Error("Subject is required. Please generate a subject first.");
    }

    const campaignName = `LGN ${campaignNumber}`;
    const campaignSubject = subject;

    const brevoPayload = {
      name: campaignName,
      subject: campaignSubject,
      sender: {
        name: "Fabien Guilleux",
        email: "fabien@deux.io"
      },
      htmlContent: htmlContent,
      recipients: {
        listIds: [parseInt(brevoListId)]
      },
      inlineImageActivation: false,
      mirrorActive: false,
      recurring: false,
      type: "classic"
    };

    console.log("Sending to Brevo API:", { name: campaignName, subject: campaignSubject });

    const brevoResponse = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey
      },
      body: JSON.stringify(brevoPayload)
    });

    console.log("Brevo response status:", brevoResponse.status);

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${brevoResponse.status} - ${errorData}`);
    }

    const data = await brevoResponse.json();
    console.log("Campaign created successfully:", data.id);

    return new Response(
      JSON.stringify({ success: true, campaignId: data.id, message: "Campaign created successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating Brevo campaign:", error);
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