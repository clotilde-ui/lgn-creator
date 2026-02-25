import { NewsletterData } from '../types';

function convertMarkdownToHTML(text: string): string {
  let html = text;

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #232323; text-decoration: underline;">$1</a>');

  return html;
}

function extractTitle(summary: string): string {
  const lines = summary.split('\n');
  const firstLine = lines[0].trim();
  return firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
}

function formatSummaryToHTML(summary: string): string {
  const lines = summary
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let result = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : null;

    if (line.startsWith('#')) {
      let titleText = line.replace(/^#+\s*/, '');
      titleText = convertMarkdownToHTML(titleText);
      const marginTop = i > 0 ? '20px' : '0';
      // Pas de margin-bottom : le paragraphe qui suit doit être collé au titre
      result += `<p style="margin: ${marginTop} 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;"><strong>${titleText}</strong></p>`;
    } else {
      const htmlLine = convertMarkdownToHTML(line);
      // Espace après le paragraphe, sauf si le suivant est un titre (le titre gère son propre espace avant avec margin-top)
      const isNextHeading = nextLine && nextLine.startsWith('#');
      const marginBottom = isNextHeading ? '0' : '10px';
      result += `<p style="margin: 0 0 ${marginBottom} 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">${htmlLine}</p>`;
    }
  }

  return result;
}

export function generateEmailHTML(data: NewsletterData, newsletterNumber: string): string {
  const {
    article1,
    article2,
    article3,
    tool,
    deuxioArticle,
    linkedinPostUrl,
    linkedinPostExcerpt,
  } = data;

  if (!article1 && !article2 && !article3 && !tool) {
    return '';
  }

  const title1 = article1 ? (article1.title || extractTitle(article1.summary)) : '';
  const title2 = article2 ? (article2.title || extractTitle(article2.summary)) : '';
  const title3 = article3 ? (article3.title || extractTitle(article3.summary)) : '';
  const toolName = tool ? (tool.toolName || 'Outil') : '';

  const body1 = article1 ? formatSummaryToHTML(article1.summary) : '';
  const body2 = article2 ? formatSummaryToHTML(article2.summary) : '';
  const body3 = article3 ? formatSummaryToHTML(article3.summary) : '';
  const toolBody = tool ? formatSummaryToHTML(tool.summary) : '';

  const author1 = article1?.author || 'Auteur inconnu';
  const author2 = article2?.author || 'Auteur inconnu';
  const author3 = article3?.author || 'Auteur inconnu';

  const tag1 = (article1?.tag || '').toUpperCase();
  const tag2 = (article2?.tag || '').toUpperCase();
  const tag3 = (article3?.tag || '').toUpperCase();
  const tagTool = (tool?.tag || '').toUpperCase();

  const deuxioArticleTitle = deuxioArticle?.title || 'Article deux.io';
  const linkedinUrl = linkedinPostUrl || '#';
  const linkedinExcerpt = linkedinPostExcerpt || 'Post LinkedIn';

  const url1 = article1?.url || '#';
  const url2 = article2?.url || '#';
  const url3 = article3?.url || '#';
  const urlTool = tool?.url || '#';
  const urlDeuxioArticle = deuxioArticle?.url || '#';

  const campaignNumber = newsletterNumber;

  const summaryItems = [];
  if (article1) summaryItems.push(`1️⃣ ${title1}`);
  if (article2) summaryItems.push(`2️⃣ ${title2}`);
  if (article3) summaryItems.push(`3️⃣ ${title3}`);
  if (tool) summaryItems.push(`⚒️ L'outil de la semaine : ${toolName}`);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
  <title>LaGrowthNews n° ${newsletterNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Lato, sans-serif; background-color: #faf5ed;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf5ed;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 20px 20px 20px;">
              <img src="https://img.mailinblue.com/4032979/images/content_library/original/67482c9fa108a4b37484c08b.png" alt="LaGrowthNews" width="200" style="display: block; margin: 0 auto;">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 20px 20px 20px;">
              <p style="margin: 0; font-family: Syne, sans-serif; font-size: 16px; color: #ffb7fa; font-weight: 600;">
                LaGrowthNews n° ${newsletterNumber}
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">Salut,</p>
              <p style="margin: 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">De retour pour LaGrowthNews !</p>
              <p style="margin: 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">Ce que vous allez découvrir cette semaine :</p>
              ${summaryItems.map(item => `<p style="margin: 5px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">${item}</p>`).join('')}
              <p style="margin: 10px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">Bonne lecture !</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 15px 40px;">
              <hr style="border: none; border-top: 1px dashed #232323; width: 70%; margin: 0;">
            </td>
          </tr>

          <!-- Section Title -->
          <tr>
            <td style="padding: 15px 40px;">
              <h2 style="margin: 0; font-family: Lato, sans-serif; font-size: 32px; color: #232323;">Les 3 meilleurs contenus de la semaine</h2>
            </td>
          </tr>

          ${article1 ? `
          <!-- Article 1 -->
          <tr>
            <td style="padding: 15px 40px 0 40px;">
              <h3 style="margin: 0; font-family: Lato, sans-serif; font-size: 24px; color: #232323;">
                <a href="${url1}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: none;">${title1}</a>
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 40px;">
              <span style="display: inline-block; background-color: #FFBEFA; color: #FFFFFF; padding: 4px 10px; font-family: Lato, sans-serif; font-size: 14px; font-style: italic;">${tag1}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 40px;">
              ${body1}
              <p style="margin: 15px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                <a href="${url1}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: underline;"><em>Lire l'article</em></a>
                <em> by ${author1}</em>
              </p>
            </td>
          </tr>
          ` : ''}

          ${article2 ? `
          <!-- Article 2 -->
          <tr>
            <td style="padding: 30px 40px 0 40px;">
              <h3 style="margin: 0; font-family: Lato, sans-serif; font-size: 24px; color: #232323;">
                <a href="${url2}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: none;">${title2}</a>
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 40px;">
              <span style="display: inline-block; background-color: #FFBEFA; color: #FFFFFF; padding: 4px 10px; font-family: Lato, sans-serif; font-size: 14px; font-style: italic;">${tag2}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 40px;">
              ${body2}
              <p style="margin: 15px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                <a href="${url2}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: underline;"><em>Lire l'article</em></a>
                <em> by ${author2}</em>
              </p>
            </td>
          </tr>
          ` : ''}

          ${article3 ? `
          <!-- Article 3 -->
          <tr>
            <td style="padding: 30px 40px 0 40px;">
              <h3 style="margin: 0; font-family: Lato, sans-serif; font-size: 24px; color: #232323;">
                <a href="${url3}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: none;">${title3}</a>
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 40px;">
              <span style="display: inline-block; background-color: #FFBEFA; color: #FFFFFF; padding: 4px 10px; font-family: Lato, sans-serif; font-size: 14px; font-style: italic;">${tag3}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 40px;">
              ${body3}
              <p style="margin: 15px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                <a href="${url3}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: underline;"><em>Lire l'article</em></a>
                <em> by ${author3}</em>
              </p>
            </td>
          </tr>
          ` : ''}

          ${tool ? `
          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 30px 40px 15px 40px;">
              <hr style="border: none; border-top: 1px dashed #232323; width: 70%; margin: 0;">
            </td>
          </tr>

          <!-- Tool Section -->
          <tr>
            <td style="padding: 15px 40px;">
              <h2 style="margin: 0; font-family: Lato, sans-serif; font-size: 32px; color: #232323;">
                <strong>⚒️ L'outil de la Semaine : </strong>
                <a href="${urlTool}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #232323; text-decoration: none;">${toolName}</a>
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 40px;">
              <span style="display: inline-block; background-color: #FFBEFA; color: #FFFFFF; padding: 4px 10px; font-family: Lato, sans-serif; font-size: 14px; font-style: italic;">${tagTool}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 15px 40px;">
              <a href="${urlTool}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}">
                <img src="https://img.mailinblue.com/4032979/images/content_library/original/68da9b135ccbe12268dff65d.png" alt="${toolName}" width="100%" style="display: block; max-width: 520px;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 40px;">
              ${toolBody}
            </td>
          </tr>
          ` : ''}

          ${deuxioArticle || linkedinPostUrl ? `
          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 30px 40px 15px 40px;">
              <hr style="border: none; border-top: 1px dashed #232323; width: 70%; margin: 0;">
            </td>
          </tr>

          <!-- Deuxio Section -->
          <tr>
            <td style="padding: 15px 40px;">
              <h2 style="margin: 0; font-family: Lato, sans-serif; font-size: 32px; color: #232323;">
                <strong>📖 Les ressources made by </strong>
                <a href="https://deux.io/?utm_source=newsletter&utm_medium=email" style="color: #232323; text-decoration: none;"><strong>deux.io</strong></a>
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 40px;">
              ${deuxioArticle ? `<p style="margin: 0 0 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                📚 <span style="background-color: #ffb7fa; padding: 2px 8px;"><a href="${urlDeuxioArticle}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignNumber}" style="color: #000000; text-decoration: none;"><em>ARTICLE :</em></a></span> <em>${deuxioArticleTitle}</em>
              </p>` : ''}
              ${linkedinPostUrl ? `<p style="margin: 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                <em>💼 </em><a href="${linkedinUrl}"><span style="background-color: #0077B5; padding: 2px 8px; color: #FFFFFF;"><em>LINKEDIN</em></span></a><span style="background-color: #0077B5; padding: 2px 8px; color: #FFFFFF;"><em>:</em></span> <em>${linkedinExcerpt}</em>
              </p>` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 30px 40px 15px 40px;">
              <hr style="border: none; border-top: 1px dashed #232323; width: 70%; margin: 0;">
            </td>
          </tr>

          <!-- Footer CTA -->
          <tr>
            <td style="padding: 15px 40px;">
              <h2 style="margin: 0 0 15px 0; font-family: Lato, sans-serif; font-size: 32px; color: #232323;"><strong>✌️ deux.io à votre service</strong></h2>
              <p style="margin: 0 0 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                deux.io est une agence qui combine <span style="color: #ffb7fa;"><strong>créativité, data et technologie pour accélérer la croissance des entreprises</strong></span>.
              </p>
              <p style="margin: 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                Nous aidons nos clients à optimiser leur acquisition, automatiser leurs workflows et booster leur ROI grâce à des stratégies innovantes et actionnables.
              </p>
              <p style="margin: 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                Notre mission : transformer vos objectifs business en résultats concrets.
              </p>
              <p style="margin: 10px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                Vous avez des questions, un message à nous faire passer ? Vous pouvez répondre à ce mail (on répond en 48 heures).
              </p>
              <p style="margin: 10px 0 20px 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">
                Si vous souhaitez vous faire accompagner 👇
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <a href="https://deuxio.typeform.com/to/MMUCIr?typeform-source=newsletter" style="display: inline-block; background-color: #232323; color: #ffffff; font-family: Lato, sans-serif; font-size: 17px; padding: 15px 40px; text-decoration: none; border-radius: 4px;">
                Prendre rendez-vous
              </a>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">À la semaine prochaine</p>
              <p style="margin: 10px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">----</p>
              <p style="margin: 5px 0 0 0; font-family: Lato, sans-serif; font-size: 18px; line-height: 1.5; color: #232323;">La team deux.io</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
