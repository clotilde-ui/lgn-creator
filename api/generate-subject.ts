import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { article1Summary, article2Summary, article3Summary, toolSummary } = req.body;

    const prompt = `Lis tous les articles de la newsletter :\n\nArticle 1 : ${article1Summary}\n\nArticle 2 : ${article2Summary}\n\nArticle 3 : ${article3Summary}\n\nOutil de la semaine : ${toolSummary}\n\nTrouves un objet putaclic pour la newsletter : court et percutant. Pas d'emoji. Il doit donner envie d'ouvrir le mail. Réponds UNIQUEMENT avec l'objet, sans guillemets ni texte additionnel.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "Tu es un expert en marketing par email. Tu crées des objets d'emails accrocheurs et percutants qui donnent envie de cliquer.",
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const subject = data.choices[0].message.content.trim();

    return res.status(200).json({ success: true, subject });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
