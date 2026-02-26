import { NewsletterData } from '../types';

function extractTitle(summary: string): string {
  const lines = summary.split('\n');
  const firstLine = lines[0].trim();
  return firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
}

function formatSummaryForHTML(summary: string): string {
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
      const prefix = i > 0 ? '<p class="default"><br></p>' : '';
      result += `${prefix}<p class="default"><strong>${titleText}</strong></p>`;
    } else {
      const htmlLine = convertMarkdownToHTML(line);
      result += `<p class="default">${htmlLine}</p>`;
    }
  }

  return result;
}

function convertMarkdownToHTML(text: string): string {
  let html = text;

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}

function escapeForYAML(text: string): string {
  return text.replace(/'/g, "''");
}

export function generateNewsletterHTML(data: NewsletterData, newsletterNumber: string): string {
  const {
    article1,
    article2,
    article3,
    tool,
    deuxioArticle,
    linkedinPostUrl,
    linkedinPostExcerpt,
  } = data;

  if (!article1 || !article2 || !article3 || !tool) {
    return '';
  }

  const title1 = escapeForYAML(article1.title || extractTitle(article1.summary));
  const title2 = escapeForYAML(article2.title || extractTitle(article2.summary));
  const title3 = escapeForYAML(article3.title || extractTitle(article3.summary));
  const toolName = escapeForYAML(tool.toolName || 'Outil');

  const body1 = escapeForYAML(formatSummaryForHTML(article1.summary));
  const body2 = escapeForYAML(formatSummaryForHTML(article2.summary));
  const body3 = escapeForYAML(formatSummaryForHTML(article3.summary));
  const toolBody = escapeForYAML(formatSummaryForHTML(tool.summary));

  const author1 = escapeForYAML(article1.author || 'Auteur inconnu');
  const author2 = escapeForYAML(article2.author || 'Auteur inconnu');
  const author3 = escapeForYAML(article3.author || 'Auteur inconnu');

  const tag1 = escapeForYAML((article1.tag || '').toUpperCase());
  const tag2 = escapeForYAML((article2.tag || '').toUpperCase());
  const tag3 = escapeForYAML((article3.tag || '').toUpperCase());
  const tagTool = escapeForYAML((tool.tag || '').toUpperCase());

  const deuxioArticleTitle = escapeForYAML(deuxioArticle?.title || 'Article deux.io');
  const linkedinUrl = escapeForYAML(linkedinPostUrl || '#');
  const linkedinExcerpt = escapeForYAML(linkedinPostExcerpt || 'Post LinkedIn');

  const url1 = article1.url;
  const url2 = article2.url;
  const url3 = article3.url;
  const urlTool = tool.url;
  const urlDeuxioArticle = deuxioArticle?.url || '#';

  const campaignNumber = newsletterNumber;

  return `brandUpdateTime: '2024-11-28T08:46:52.252Z'
firstLoadSocialIcons: false
hideSwapBanner: false
font-fallback:
  default: tahoma
  headings: tahoma
hasAIFeature: true
campaignType: classic
fieldsHistory: []
subject: '{{objet}}'
ui:
  showDeleteOption: false
  showMoreOption: false
user-hash: 44229dcc70206f565eacd9e109020aaf
author: ""
name: ""
id: ""
version: 3.0.1
fields: {}
fonts:
  - 'https://fonts.googleapis.com/css2?family=Syne&family=Lato'
styles:
  default:
    properties:
      color: '#232323'
      font-family: Syne
      font-size: 18px
      line-height: '1.5'
    title: Paragraph
  default-button:
    properties:
      background-color: '#232323'
      border-color: '#232323'
      border-radius: 4px
      border-width: 0px
      color: '#ffffff'
      font-family: Syne
      font-size: 16px
      remove-vml-button: optional
      width: 50%
    title: Button
  default-heading1:
    properties:
      color: '#232323'
      font-family: Syne
      font-size: 36px
    title: 'Heading 1'
  default-heading2:
    properties:
      color: '#232323'
      font-family: Syne
      font-size: 32px
    title: 'Heading 2'
  default-heading3:
    properties:
      color: '#232323'
      font-family: Syne
      font-size: 24px
    title: 'Heading 3'
  default-heading4:
    properties:
      color: '#232323'
      font-family: Syne
      font-size: 22px
    title: 'Heading 4'
  default-link:
    properties:
      color: '#232323'
      text-decoration: underline
    title: Link
media:
  320px:
    max-width: 600
    min-width: 0
body:
  content:
    -
      type: rows
      thumbnail: null
      isCustomBlock: null
      customBlockId: null
      moduleName: null
      sidebarSection: null
      sync-module-id: null
      content-type: wrapper
      title: Wrapper
      layout:
        320px:
          width: 320px
        default:
          align: center
          valign: top
      content:
        -
          type: grid-row
          thumbnail: /assets/img/editor/grid_12.svg
          isCustomBlock: null
          customBlockId: null
          moduleName: viewInBrowser
          sidebarSection: null
          sync-module-id: null
          align: top
          title: section
          layout:
            320px:
              display: rows
              width: 100%
            default:
              align: center
              full-width: true
              background-color: transparent
              display: none
              padding-bottom: 5px
              padding-top: 5px
              width: 100%
              valign: top
              padding-left: null
              padding-right: null
          content:
            -
              type: grid-column
              thumbnail: null
              isCustomBlock: null
              customBlockId: null
              moduleName: null
              sidebarSection: null
              sync-module-id: null
              isEmpty: false
              label: 'Drop content here'
              title: 'column 1'
              layout:
                320px: {}
                default:
                  padding-left: 0px
                  padding-right: 0px
                  valign: top
              content:
                -
                  type: text
                  thumbnail: null
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Webversion
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: center
                      line-height: 16px
                      padding-left: 30px
                      padding-right: 30px
                      text-align: center
                      width: 100%
                  content: "<p><a href=\\"{{ mirror }}\\">
                      <span style=\\"font-family: arial,helvetica,sans-serif;color:#858588;font-size: 12px; text-decoration: underline;\\">
                      Afficher dans le navigateur</span></a></p>"
          dist: '12'
          gutter: 0px
        -
          type: grid-row
          thumbnail: /assets/img/editor/element-header.svg
          isCustomBlock: null
          customBlockId: null
          moduleName: header
          sidebarSection: null
          sync-module-id: null
          align: top
          title: Entête
          layout:
            320px:
              display: rows
              width: 100%
            default:
              align: center
              width: 100%
              valign: top
              padding-left: null
              padding-right: null
          content:
            -
              type: grid-column
              thumbnail: null
              isCustomBlock: null
              customBlockId: null
              moduleName: null
              sidebarSection: null
              sync-module-id: null
              isEmpty: false
              label: 'Drop content here'
              title: 'colonne de grille'
              layout:
                320px: {}
                default:
                  removePadding: true
                  padding-left: 0px
                  padding-right: 0px
                  valign: top
              content:
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 20px
                      padding-top: 20px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: ""
                -
                  type: image
                  thumbnail: 'https://img.mailinblue.com/4032979/images/rnb/original/6142ee1a09ceee5f2c65fbb5.png'
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: brand-logo
                  sidebarSection: null
                  sync-module-id: null
                  title: Logo
                  layout:
                    320px:
                      max-width: 320px
                      width: 85%
                    default:
                      align: center
                      canvas-height: 38.5234375px
                      dynamic: false
                      embed: false
                      img-border-radius: 0px
                      imgSize: '34690'
                      removeMargin: true
                      removePadding: false
                      border-color: '#000000'
                      border-style: solid
                      margin-bottom: 0px
                      margin-top: 10px
                      padding-bottom: 0px
                      padding-left: 0px
                      padding-right: 0px
                      padding-top: 0px
                      width: 200px
                      valign: top
                  content:
                    src: 'https://img.mailinblue.com/4032979/images/content_library/original/67482c9fa108a4b37484c08b.png'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-top: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p style="text-align:center;"><span style="color:#ffb7fa;font-family:syne;font-size:16px;"><strong>LaGrowthNews n° ${newsletterNumber}</strong></span></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      padding-left: 15px
                      padding-right: 15px
                      width: 100%
                    default:
                      align: left
                      line-height: '1.5'
                      padding-bottom: 20px
                      padding-top: 20px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">Salut,</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;">&nbsp;</p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">De retour pour LaGrowthNews !</span><br><span style="font-family:lato;">&nbsp;</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">Ce que vous allez découvrir cette semaine :</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;">&nbsp;</p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">1️⃣ ${title1}</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">2️⃣ ${title2}</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">3️⃣ ${title3}</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">⚒️ &nbsp;L''outil de la semaine : ${toolName}</span></p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;">&nbsp;</p><p style="font-style:normal;font-weight:400;text-decoration-style:initial;text-decoration-thickness:initial;"><span style="font-family:lato;">Bonne lecture !&nbsp;</span></p>'
                -
                  type: divider
                  thumbnail: /assets/img/editor/element_divider.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Diviseur
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: center
                      removeMargin: false
                      removePadding: true
                      border-color: '#232323'
                      border-style: dashed
                      display: auto
                      margin-bottom: 0px
                      margin-top: 0px
                      padding-bottom: 15px
                      padding-top: 15px
                      width: 70%
                      border-width: 1px
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 5px
                      padding-right: 5px
                      text-align: center
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h2 class="default-heading2"><span style="color:#232323;font-family:lato;font-size:32px;">Les 3 meilleurs contenus de la semaine</span></h2>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h3 class="default-heading3"><a href="${url1}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><span style="font-family:lato;" id="isPasted">${title1}</span></a></h3>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      applyAllBorder: true
                      border-width: '-1px'
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p class="default"><span style="background-color:#FFBEFA;color:#FFFFFF;font-family:lato;font-size:14px;font-style:italic;">${tag1}</span></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '${body1}<p class="default"><a href="${url1}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><em>Lire l''article</em></a><em>&nbsp;by ${author1}</em></p><p class="default"><br></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h3 class="default-heading3" data-start="197" data-end="263" id="isPasted"><a href="${url2}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><span style="font-family:lato;" id="isPasted">${title2}</span></a></h3>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      applyAllBorder: true
                      border-width: '-1px'
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p class="default"><span style="background-color:#FFBEFA;color:#FFFFFF;font-family:lato;font-size:14px;font-style:italic;">${tag2}</span></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 30px
                      padding-top: 25px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '${body2}<p class="default"><a href="${url2}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><em>Lire l''article</em></a><em>&nbsp;by ${author2}</em></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h3 class="default-heading3"><a href="${url3}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><span style="font-family:lato;" id="isPasted">${title3}</span></a></h3>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      applyAllBorder: true
                      border-width: '-1px'
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p class="default"><span style="background-color:#FFBEFA;color:#FFFFFF;font-family:lato;font-size:14px;font-style:italic;">${tag3}</span></p>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      applyAllBorder: true
                      border-style: solid
                      padding-bottom: 30px
                      padding-top: 25px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '${body3}<p class="default"><a href="${url3}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><em>Lire l''article</em></a><em>&nbsp;by ${author3}</em></p>'
                -
                  type: divider
                  thumbnail: /assets/img/editor/element_divider.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Diviseur
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: center
                      removeMargin: false
                      removePadding: true
                      border-color: '#232323'
                      border-style: dashed
                      display: auto
                      margin-bottom: 0px
                      margin-top: 0px
                      padding-bottom: 15px
                      padding-top: 15px
                      width: 70%
                      border-width: 1px
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h2 class="default-heading2"><span style="color:#232323;font-family:lato;font-size:32px;"><strong>⚒️ L''outil de la Semaine : </strong></span><a href="${urlTool}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><span style="color:#232323;font-family:lato;font-size:32px;">${toolName}</span></a></h2>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      removeMargin: true
                      margin-bottom: 30px
                      padding-bottom: 0px
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p class="default"><span style="background-color:#FFBEFA;color:#FFFFFF;font-family:lato;font-size:14px;font-style:italic;">${tagTool}</span></p>'
                -
                  type: image
                  thumbnail: /assets/img/editor/element_image.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Image
                  layout:
                    320px:
                      max-width: 320px
                      width: 100%
                    default:
                      align: center
                      canvas-height: 343.796875px
                      dynamic: false
                      embed: false
                      img-border-radius: 0px
                      imgSize: '327812'
                      type: absoluteLink
                      background-position: center
                      background-repeat: no-repeat
                      background-size: auto
                      padding-bottom: 15px
                      padding-top: 15px
                      width: 100%
                      valign: top
                  content:
                    src: 'https://img.mailinblue.com/4032979/images/content_library/original/68da9b135ccbe12268dff65d.png'
                    alt: ${toolName}
                    href: '${urlTool}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}'
                -
                  type: text
                  thumbnail: /assets/img/editor/element_text.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Texte
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '${toolBody}'
                -
                  type: divider
                  thumbnail: /assets/img/editor/element_divider.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Diviseur
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: center
                      removeMargin: false
                      removePadding: true
                      border-color: '#232323'
                      border-style: dashed
                      display: auto
                      margin-bottom: 0px
                      margin-top: 0px
                      padding-bottom: 15px
                      padding-top: 15px
                      width: 70%
                      border-width: 1px
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h2 class="default-heading2"><span style="color:#232323;font-family:lato;font-size:32px;"><strong>📖 Les ressources made by </strong></span><span style="color:#232323;font-family:lato;font-size:32px;"><a href="https://deux.io/?utm_source=newsletter&amp;utm_medium=email" target="_blank" rel="noopener noreferrer"><strong>deux.io</strong></a></span></h2>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 0px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p><span style="color:#000000;font-family:lato;font-size:18px;">📚&nbsp;</span><span style="background-color:#ffb7fa;color:#000000;font-family:lato;font-size:18px;"><a href="${urlDeuxioArticle}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=${campaignNumber}" target="_blank" rel="noopener noreferrer"><em>ARTICLE &nbsp;:</em><em>&nbsp;</em></a></span> <em>${deuxioArticleTitle}</em></p><p><span style="background-color:#faf5ed;color:#000000;font-family:lato;font-size:18px;"><em>💼&nbsp;</em></span><a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer"><span style="background-color:#0077B5;color:#FFFFFF;font-family:lato;font-size:18px;"><em>LINKEDIN&nbsp;</em></span></a><span style="background-color:#0077B5;color:#FFFFFF;font-family:lato;font-size:18px;"><em>:&nbsp;</em></span><em>&nbsp;</em><em>${linkedinExcerpt}</em></p>'
                -
                  type: divider
                  thumbnail: /assets/img/editor/element_divider.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  title: Diviseur
                  layout:
                    320px:
                      width: 100%
                    default:
                      align: center
                      removeMargin: false
                      removePadding: true
                      border-color: '#232323'
                      border-style: dashed
                      display: auto
                      margin-bottom: 0px
                      margin-top: 0px
                      padding-bottom: 15px
                      padding-top: 15px
                      width: 70%
                      border-width: 1px
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<h2 class="default-heading2"><span style="color:#232323;font-family:lato;font-size:32px;"><strong>✌️ deux.io à votre service</strong></span></h2>'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p><span style="font-family:lato;">deux.io est une agence qui combine&nbsp;</span><span style="color:#ffb7fa;font-family:lato;"><strong>créativité, data et technologie pour accélérer la croissance des entreprises</strong></span><span style="font-family:lato;"><strong>.&nbsp;</strong></span></p><p>&nbsp;</p><p><span style="font-family:lato;">Nous aidons nos clients à optimiser leur acquisition, automatiser leurs workflows et booster leur ROI grâce à des stratégies innovantes et actionnables.&nbsp;</span></p><p>&nbsp;</p><p><span style="font-family:lato;">Notre mission : transformer vos objectifs business en résultats concrets.</span></p><p>&nbsp;</p><p><span style="font-family:lato;">Vous avez des questions, un message à nous faire passer ? Vous pouvez répondre à ce mail (on répond en 48 heures).</span></p><p>&nbsp;</p><p><span style="font-family:lato;">Si vous souhaitez vous faire accompagner 👇</span></p>'
                -
                  type: text-button
                  thumbnail: /assets/img/editor/element_button.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: null
                  sidebarSection: null
                  sync-module-id: null
                  text: '<p><span style="font-family:lato;font-size:17px;">Prendre rendez-vous</span></p>'
                  title: Bouton
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 50%
                    default:
                      align: center
                      data-href: 'https://deuxio.typeform.com/to/MMUCIr?typeform-source=newsletter'
                      data-placeholder-href: 'https://deuxio.typeform.com/to/MMUCIr?typeform-source=newsletter'
                      item-height: 50.263671875px
                      type: absoluteLink
                      border-radius: 0px
                      margin-bottom: 18px
                      margin-top: 18px
                      padding-bottom: 15px
                      padding-top: 15px
                      text-align: center
                      text-valign: top
                      width: 33%
                      valign: top
                  content:
                    text: '<p><span style="font-family:lato;font-size:17px;">Prendre rendez-vous</span></p>'
                    href: 'https://deuxio.typeform.com/to/MMUCIr?typeform-source=newsletter'
                -
                  type: text
                  thumbnail: /assets/img/editor/element-title.svg
                  isCustomBlock: null
                  customBlockId: null
                  moduleName: text-title
                  sidebarSection: null
                  sync-module-id: null
                  title: Titre
                  layout:
                    320px:
                      padding-left: 10px
                      padding-right: 10px
                      width: 100%
                    default:
                      align: left
                      padding-top: 15px
                      text-align: left
                      text-valign: top
                      width: 100%
                      valign: top
                  content: '<p><span style="font-family:lato;">À la semaine prochaine</span></p><p>&nbsp;</p><p><span style="font-family:lato;">----</span></p><p><span style="font-family:lato;">La team deux.io</span></p>'
          dist: '12'
          gutter: 0px
  layout:
    320px:
      padding-bottom: 20px
      padding-top: 20px
      width: 320px
    default:
      background-color: '#faf5ed'
      direction: ltr
      wrapper-width: 600px`;
}