import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEWSLETTER_PROMPT = `Tu envoies chaque semaine une newsletter marketing à tes 4000 abonnés.
Chaque semaine, je cherche 3 articles sur des sujets marketing, et je te les donne pour que tu les résumes en quelques points clés pour que tes lecteurs n'aient pas besoin d'aller sur le site de l'article pour le lire. Parfois, les articles d'origine sont en anglais, alors tu fais le résumé en français.

Voici quelques consignes à respecter quand tu fais ces résumés :
- NE PAS mettre de titre au début du résumé (le titre sera ajouté automatiquement)
- diviser le résumé en plusieurs paragraphes clés : ces paragraphes ont un titre et sont numérotés devant le titre de cette façon : #1. {{titre}} . Ils sont en gras
- pas d'émojis
- pas de tirets dans le texte (mais plutôt des virgules)
- pas de virgule après un "et" si la virgule n'est pas nécessaire
- s'il y a des bullet points, ils doivent tous être à la même distance de la marge
- peu de gras dans le texte
- éviter l'italique si ce n'est pas nécessaire
- le dernier paragraphe est une conclusion, dont le titre est : ✅ À retenir (en gras)
- NE PAS mettre "Lire l'article by {{auteur}}" à la fin du résumé (cela sera ajouté automatiquement)
- parfois, l'article que je vais te donner sera en anglais. Dans la traduction, tu devras respecter le jargon français du domaine d'expertise.
- ne mets pas de barres entre les paragraphes`;

const TOOL_PROMPT = `Tu écris la section "outil de la semaine" d'une newsletter marketing (4000 abonnés). On te donne le texte d'une landing page d'un outil, et tu dois le présenter brièvement.

Consignes de style :
- Écris comme un pote qui recommande un truc qu'il a testé, pas comme un copywriter
- Tutoiement obligatoire
- Phrases courtes et directes. Pas de superlatifs, pas de "révolutionnaire", pas de "game-changer"
- Ne commence JAMAIS par une question rhétorique ("Tu cherches un outil qui..." / "Marre de...")
- Ne commence JAMAIS par "Imagine..." ou "Et si..."
- Pas de liste de features à la chaîne. Explique concrètement ce que l'outil fait et pourquoi c'est utile
- Pas d'émojis, pas de tirets, pas de barres ou séparateurs
- Pas de virgule après un "et" si ce n'est pas grammaticalement nécessaire
- Évite les formulations génériques et creuses type "un must-have", "indispensable", "tes campagnes vont passer au niveau supérieur"
- 8 à 10 lignes max
- Tu peux être un peu drôle mais sans forcer`;

const AUTHOR_PROMPT = `Tu es un assistant qui extrait le nom de l'auteur d'un article.
À partir du texte brut d'un article, trouve et retourne UNIQUEMENT le nom de l'auteur.
Si tu ne trouves pas d'auteur, retourne "Auteur inconnu".
Ne retourne que le nom, rien d'autre.`;

const TOOL_NAME_PROMPT = `Tu es un assistant qui extrait le nom d'un outil à partir du texte d'une landing page.
À partir du texte brut de la page, trouve et retourne UNIQUEMENT le nom de l'outil.
Si tu ne trouves pas le nom, retourne "Outil".
Ne retourne que le nom, rien d'autre.`;

const TITLE_PROMPT = `Tu es un assistant qui extrait le titre d'une page web.
À partir du texte brut, trouve et retourne UNIQUEMENT le titre principal de la page, TRADUIT EN FRANÇAIS.
Si le titre est en anglais ou dans une autre langue, traduis-le en français.
Si tu ne trouves pas de titre clair, résume en quelques mots le sujet principal en français.
Ne retourne que le titre traduit en français, rien d'autre. Maximum 15 mots.`;

const TAG_PROMPT = `Tu es un assistant qui génère un tag catégorisé avec emoji pour un article ou un outil marketing.

À partir du contenu fourni, analyse le sujet principal et génère UN SEUL tag descriptif avec un emoji pertinent.

Format attendu : [emoji] [Catégorie]

Exemples de tags possibles :
- 📊 Analytics
- 🤖 IA
- 💰 E-commerce
- 🛠️ Automation
- 📱 Mobile
- 🎨 Design
- 📧 Email Marketing
- 🔍 SEO
- 💻 SaaS
- 🚀 Growth
- 📈 Performance
- 🎯 Stratégie
- 🕷️ Scraping
- 💡 Innovation
- 📝 Content
- 🔐 Sécurité
- 💳 Paiement
- 👥 Social Media
- 🎥 Vidéo
- 📣 Publicité

Retourne UNIQUEMENT le tag avec son emoji (ex: "📊 Analytics"). Ne retourne rien d'autre.`;

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
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const { url, type } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch URL: ${response.statusText}` });
    }

    const html = await response.text();

    const pageTitle = (html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || '')
      .replace(/\s+/g, ' ')
      .trim();
    const ogTitle = (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1] || '')
      .replace(/\s+/g, ' ')
      .trim();
    const h1Title = (html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const text = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    let promptToUse: string, userMessage: string, extractPrompt: string | null;
    let extractTitle = false;

    if (type === 'tool') {
      promptToUse = TOOL_PROMPT;
      userMessage = `Voici l'extrait de la landing page de l'outil :\n\n${text}`;
      extractPrompt = TOOL_NAME_PROMPT;
    } else if (type === 'deuxio') {
      promptToUse = TITLE_PROMPT;
      userMessage = text;
      extractPrompt = null;
    } else {
      promptToUse = NEWSLETTER_PROMPT;
      userMessage = `Voici l'article à résumer :\n\n${text}`;
      extractPrompt = AUTHOR_PROMPT;
      extractTitle = true;
    }

    const requests: Array<{
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature: number;
      max_tokens: number;
    }> = [{
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: promptToUse },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: type === 'tool' ? 800 : (type === 'deuxio' ? 100 : 2000),
    }];

    if (extractPrompt) {
      requests.push({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: extractPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 50,
      });
    }

    if (type !== 'deuxio') {
      requests.push({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TAG_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.5,
        max_tokens: 30,
      });
    }

    if (extractTitle) {
      requests.push({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TITLE_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 60,
      });
    }

    const openaiResponses = await Promise.all(
      requests.map(body =>
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify(body),
        })
      )
    );

    for (const resp of openaiResponses) {
      if (!resp.ok) {
        const errorData = await resp.json();
        return res.status(resp.status).json({
          error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
        });
      }
    }

    const responseData = await Promise.all(
      openaiResponses.map(r => r.json())
    );

    const summary = responseData[0].choices[0]?.message?.content || '';
    const extracted = responseData[1]?.choices[0]?.message?.content?.trim() || '';
    const tag = responseData[2]?.choices[0]?.message?.content?.trim() || '';
    const titleExtracted = extractTitle ? (responseData[3]?.choices[0]?.message?.content?.trim() || '') : '';

    const result: Record<string, unknown> = { text, summary, url };

    if (type === 'tool') {
      result.toolName = extracted;
      result.tag = tag;
    } else if (type === 'deuxio') {
      result.title = summary || ogTitle || pageTitle || h1Title;
    } else {
      result.author = extracted;
      result.tag = tag;
      const cleanedTitle = titleExtracted.replace(/^Titre\s*:\s*/i, '').replace(/^"|"$/g, '').trim();
      result.title = cleanedTitle || ogTitle || pageTitle || h1Title;
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
