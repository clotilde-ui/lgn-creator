import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEWSLETTER_PROMPT = `Tu rédiges les résumés d'articles pour une newsletter marketing de 4000 abonnés. Je vais te donner un article (parfois en anglais) et tu le résumes en français en plusieurs points clés, pour que le lecteur n'ait pas besoin d'aller lire l'article original.

Consignes de mise en forme :
- NE PAS mettre de titre au début du résumé (il sera ajouté automatiquement)
- Diviser le résumé en plusieurs paragraphes clés, chacun avec un titre numéroté en gras, au format : #1. Titre du paragraphe (le titre seul est en gras, pas le contenu)
- Le dernier paragraphe est une conclusion avec le titre : ✅ À retenir (en gras)
- NE PAS mettre "Lire l'article by {{auteur}}" à la fin (cela sera ajouté automatiquement)
- Pas de barres entre les paragraphes

Consignes de style :
- Pas d'émojis
- Pas de tirets dans le texte (utiliser des virgules à la place)
- Pas de virgule après un "et" si ce n'est pas grammaticalement nécessaire
- Peu de gras dans le corps du texte
- Pas d'italique sauf si nécessaire
- Si l'article est en anglais, respecter le jargon français du domaine dans la traduction`;

const TOOL_PROMPT = `Pour ma newsletter, tu dois rédiger la partie : l'outil de la semaine.
Je vais te donner le lien de l'outil, ensuite tu rédigeras la partie de la newsletter : l'outil de la semaine, en t'inspirant des newsletter ci dessous.

quelques consignes :
- pas de tirets
- pas d'émojis
- un peu d'humour
- pas de virgule après un "et" si ce n'est pas grammaticalement nécessaire.
- si tu t'adresses au lecteur : tutoiement obligatoire

voilà le format et le ton attendus :

"Meta a racheté Manus il y a quelques mois, et on comprend pourquoi  Zuckerberg a mis la main sur ce "General Purpose Agent".

Contrairement aux chatbots classiques, Manus ne se contente pas de parler : il exécute.

Capable de naviguer sur le web pour comparer des offres ou remplir des formulaires à ta place, il est aussi un redoutable créateur capable de générer des sites web complets, des présentations percutantes ou même des applications de bureau fonctionnelles en quelques secondes.

Que tu aies besoin de déléguer une recherche de marché fastidieuse, de coder un outil métier sans toucher une ligne de script ou de transformer une idée brute en design pro, il agit comme un assistant multitâche ultra-rapide."

----

"Marre de nettoyer du code HTML sale pour tes projets d'IA ?

Firecrawl est le chaînon manquant. Contrairement aux scrapers classiques, il transforme n'importe quel site (même les plus complexes en React ou Vue) en un Markdown ultra-propre ou en JSON structuré. C'est l'outil parfait pour alimenter tes pipelines RAG ou tes agents autonomes sans perdre de temps en pré-processing.

En une ligne d'API, il gère les proxys, le rendu JavaScript et les anti-bots.

Le petit plus : L'endpoint /extract qui permet de décrire en langage naturel ce que tu veux récupérer (ex: "les prix et noms des produits")."
---

"Trouver des leads B2B en France, c'est souvent jongler entre trois onglets et un fichier Excel qui pleure.


Basile règle le problème en mettant tout au même endroit. Il croise les données légales (INSEE, Infogreffe, BODACC), Google Maps, les profils LinkedIn publics et les données financières pour te sortir 26 millions d'entreprises et 4,4 millions de contacts français dans une seule base bien propre. Tu filtres, tu cherches et tu exportes en quelques clics, sans repasser par la case scraping artisanal.


Le vrai argument, c'est le prix : à partir de 29€ par mois en bêta, ça pique nettement moins que la concurrence. Et pour les bidouilleurs, il y a une API et un connecteur MCP qui se branche directement sur Claude ou ton IA préférée, histoire de déléguer la prospection à un agent pendant que tu finis ton café.


Petit bonus rassurant pour ton juriste : tout est 100% RGPD compliant puisque la donnée provient de sources publiques."`;


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

    const fetchPageContent = async (targetUrl: string) => {
      const directResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
      });

      if (directResponse.ok) {
        return { content: await directResponse.text(), source: 'direct' as const };
      }

      const shouldTryFallback = [401, 403, 429, 500, 502, 503, 504].includes(directResponse.status);

      if (!shouldTryFallback) {
        return { error: `Failed to fetch URL: ${directResponse.status} ${directResponse.statusText}` };
      }

      const fallbackUrl = `https://r.jina.ai/http://${targetUrl.replace(/^https?:\/\//i, '')}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!fallbackResponse.ok) {
        return { error: `Failed to fetch URL: ${directResponse.status} ${directResponse.statusText}` };
      }

      return { content: await fallbackResponse.text(), source: 'fallback' as const };
    };

    const pageFetchResult = await fetchPageContent(url);

    if ('error' in pageFetchResult) {
      return res.status(400).json({ error: pageFetchResult.error });
    }

    const html = pageFetchResult.content;

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
