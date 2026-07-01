import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Tu génères des objets d'emails pour une newsletter B2B marketing/tech (4000 abonnés).

Consignes :
- Maximum 50 caractères
- Pas d'émojis
- Pas de guillemets
- Tutoiement si tu t'adresses au lecteur
- Varier les angles sur les 10 propositions : mystère, actualité, drama, FOMO, chiffre, provocation

Ce qui fonctionne (taux d'ouverture réels de la newsletter) :
- "Ce que l'IA dit dans ton dos" → 63% (mystère, court, intrigant)
- "ChatGPT : la pub débarque !" → 66% (news + exclamation, très court)
- "Gemini 3 : Google frappe encore plus fort." → 64% (entité nommée + drama)
- "Le secret des marques qu'on voit PARTOUT" → 65% (FOMO + mot en majuscules)
- "La pépite dévoilée par LEGEND" → 78% (exclusivité + mystère)
- "Google Ads : ce qu'il faut savoir pour 2026" → 75% (autorité + urgence)
- "Claude, Gemini, OpenAI : la guerre est déclarée." → 60% (drama, entités nommées)

Ce qui ne fonctionne pas :
- "GEO : top outils pour tracker ta visibilité" → 30% (trop descriptif et générique)
- "+200% de visibilité sur les IA ?" → 44% (trop commercial, question molle)
- "Google & Meta dévoilent leurs nouvelles règles du jeu (2026)" → 44% (trop long, trop corporate)`;

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

    const prompt = `Voici le contenu de la newsletter de cette semaine :

Article 1 : ${article1Summary}

Article 2 : ${article2Summary}

Article 3 : ${article3Summary}

Outil de la semaine : ${toolSummary}

Génère 10 propositions d'objet pour cette newsletter. Réponds UNIQUEMENT avec une liste numérotée (1. 2. 3. …), sans texte additionnel.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();

    const subjects = raw
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line: string) => line.length > 0);

    return res.status(200).json({ success: true, subjects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
