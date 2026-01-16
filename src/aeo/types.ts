export interface Article {
  id: string;
  slug: string;
  headline: string;
  metaDescription: string;
  content: string;
  contentHtml: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  categories: Category[];
  tags: Tag[];
  relatedArticles?: ArticleSummary[];
}

export interface ArticleSummary {
  id: string;
  slug: string;
  headline: string;
  metaDescription: string;
  readingTime: number;
  publishedAt: string;
  categories: Category[];
  tags: Tag[];
}

export interface Category {
  slug: string;
  name: string;
}

export interface Tag {
  slug: string;
  name: string;
}

export interface ArticlesResponse {
  articles: ArticleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientOptions {
  /** Cache TTL in seconds (default: 300) */
  cacheTtl?: number;
  /** Base URL for the API (default: https://api.cakewalk.ai) */
  baseUrl?: string;
}

export interface CacheEntry<T> {
  data: T;
  expires: number;
}
