export interface ArticleData {
  url: string;
  text: string;
  summary: string;
  author?: string;
  title?: string;
  toolName?: string;
  tag?: string;
}

export interface NewsletterData {
  article1: ArticleData | null;
  article2: ArticleData | null;
  article3: ArticleData | null;
  tool: ArticleData | null;
  deuxioArticle: ArticleData | null;
  linkedinPostUrl?: string;
  linkedinPostExcerpt?: string;
}
