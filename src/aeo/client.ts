import type {
  Post,
  PostsResponse,
  PostResponse,
  ClientOptions,
  CacheEntry,
  BlogClientConfig,
} from './types';

const DEFAULT_BASE_URL = 'https://api.cakewalk.ai';
const DEFAULT_CACHE_TTL = 300; // 5 minutes

export class BlogClient {
  private apiKey: string;
  private projectId: string;
  private baseUrl: string;
  private cacheTtl: number;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(config: BlogClientConfig) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.baseUrl = config.options?.baseUrl || DEFAULT_BASE_URL;
    this.cacheTtl = (config.options?.cacheTtl || DEFAULT_CACHE_TTL) * 1000;
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
        'X-Project-Id': this.projectId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cakewalk API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get paginated list of posts
   */
  async getPosts(options: {
    status?: 'published' | 'planned' | 'writing' | 'review' | 'all';
    limit?: number;
    offset?: number;
  } = {}): Promise<PostsResponse> {
    const { status = 'published', limit = 50, offset = 0 } = options;
    const params = new URLSearchParams({
      status,
      limit: String(limit),
      offset: String(offset),
    });

    return this.cached(`${this.projectId}:posts:${status}:${limit}:${offset}`, () =>
      this.fetch<PostsResponse>(`/v1/posts?${params}`)
    );
  }

  /**
   * Get a single post by ID
   */
  async getPostById(id: number): Promise<Post | null> {
    try {
      const response = await this.cached(`${this.projectId}:post:id:${id}`, () =>
        this.fetch<PostResponse>(`/v1/posts/${id}`)
      );
      return response.post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const response = await this.cached(`${this.projectId}:post:slug:${slug}`, () =>
        this.fetch<PostResponse>(`/v1/posts/slug/${slug}`)
      );
      return response.post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
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
