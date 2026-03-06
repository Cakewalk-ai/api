import type {
  Post,
  PostsResponse,
  PostResponse,
  Category,
  CategoriesResponse,
  ClientOptions,
  CacheEntry,
  BlogClientConfig,
} from './types';

const DEFAULT_BASE_URL = 'https://api.cakewalk.ai/api';
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
  private async fetch<T>(endpoint: string, options?: { method?: string; body?: unknown }): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Project-Id': this.projectId,
        'Content-Type': 'application/json',
      },
      ...(options?.body !== undefined && { body: JSON.stringify(options.body) }),
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
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PostsResponse> {
    const { status = 'published', category, limit = 50, offset = 0 } = options;
    const params = new URLSearchParams({
      status,
      limit: String(limit),
      offset: String(offset),
    });
    if (category) {
      params.set('category', category);
    }

    const cacheKey = `${this.projectId}:posts:${status}:${category || 'all'}:${limit}:${offset}`;
    return this.cached(cacheKey, () =>
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
   * Get all categories for the project
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.cached(`${this.projectId}:categories`, () =>
      this.fetch<CategoriesResponse>(`/v1/categories`)
    );
    return response.categories;
  }

  /**
   * Get posts pending approval
   */
  async getUnapprovedPosts(): Promise<PostsResponse> {
    return this.getPosts({ status: 'review' });
  }

  /**
   * Approve a post by ID (sets status to published)
   */
  async approvePost(id: number): Promise<Post> {
    const response = await this.fetch<PostResponse>(`/v1/posts/${id}/status`, {
      method: 'PATCH',
      body: { status: 'published' },
    });

    // Clear cached entries for this post
    for (const key of this.cache.keys()) {
      if (key.includes(':post:') || key.includes(':posts:')) {
        this.cache.delete(key);
      }
    }

    return response.post;
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
