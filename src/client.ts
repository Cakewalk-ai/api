import type {
  Article,
  ArticleSummary,
  ArticlesResponse,
  Category,
  Tag,
  ClientOptions,
  CacheEntry,
} from './types';

const DEFAULT_BASE_URL = 'https://api.cakewalk.ai';
const DEFAULT_CACHE_TTL = 300; // 5 minutes

export class BlogClient {
  private apiKey: string;
  private baseUrl: string;
  private cacheTtl: number;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(apiKey: string, options: ClientOptions = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.cacheTtl = (options.cacheTtl || DEFAULT_CACHE_TTL) * 1000;
  }

  /**
   * Internal method to handle cached fetches
   */
  private async cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, expires: Date.now() + this.cacheTtl });
    return data;
  }

  /**
   * Internal fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cakewalk API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get paginated list of articles
   */
  async getArticles(page = 1, limit = 10): Promise<ArticlesResponse> {
    return this.cached(`articles:${page}:${limit}`, () =>
      this.fetch<ArticlesResponse>(`/articles?page=${page}&limit=${limit}`)
    );
  }

  /**
   * Get a single article by slug
   */
  async getArticle(slug: string): Promise<Article | null> {
    return this.cached(`article:${slug}`, () =>
      this.fetch<Article>(`/articles/${slug}`)
    );
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(
    categorySlug: string,
    page = 1,
    limit = 10
  ): Promise<ArticlesResponse> {
    return this.cached(`category:${categorySlug}:${page}:${limit}`, () =>
      this.fetch<ArticlesResponse>(
        `/categories/${categorySlug}/articles?page=${page}&limit=${limit}`
      )
    );
  }

  /**
   * Get articles by tag
   */
  async getArticlesByTag(
    tagSlug: string,
    page = 1,
    limit = 10
  ): Promise<ArticlesResponse> {
    return this.cached(`tag:${tagSlug}:${page}:${limit}`, () =>
      this.fetch<ArticlesResponse>(
        `/tags/${tagSlug}/articles?page=${page}&limit=${limit}`
      )
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    return this.cached('categories', () =>
      this.fetch<Category[]>('/categories')
    );
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<Tag[]> {
    return this.cached('tags', () =>
      this.fetch<Tag[]>('/tags')
    );
  }

  /**
   * Clear the cache (useful for testing or forcing fresh data)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific cache entry
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }
}
