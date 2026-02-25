import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoListId = process.env.BREVO_LIST_ID;

    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured');
    }

    if (!brevoListId) {
      throw new Error('BREVO_LIST_ID not configured');
    }

    const { htmlContent, campaignNumber, subject } = req.body;

    if (!subject || subject.trim() === '') {
      throw new Error('Subject is required. Please generate a subject first.');
    }

    const campaignName = `LGN ${campaignNumber}`;

    const brevoPayload = {
      name: campaignName,
      subject,
      sender: {
        name: 'Fabien Guilleux',
        email: 'fabien@deux.io',
      },
      htmlContent,
      recipients: {
        listIds: [parseInt(brevoListId)],
      },
      inlineImageActivation: false,
      mirrorActive: false,
      recurring: false,
      type: 'classic',
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      throw new Error(`Brevo API error: ${brevoResponse.status} - ${errorData}`);
    }

    const data = await brevoResponse.json();

    return res.status(200).json({ success: true, campaignId: data.id, message: 'Campaign created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
