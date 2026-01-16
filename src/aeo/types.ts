export interface Author {
  name: string | null;
  title: string | null;
  photo_url: string | null;
  url: string | null;
  bio: string | null;
  byline: string | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  post_type: string;
  post_format: string;
  primary_keyword: string;
  secondary_keywords: string[];
  excerpt: string | null;
  body_markdown: string | null;
  body_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image_url: string | null;
  ai_summary: string | null;
  faq_questions: Array<{ question: string; answer: string }>;
  author: Author | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface PostResponse {
  post: Post;
}

export interface ClientOptions {
  /** Cache TTL in seconds (default: 300) */
  cacheTtl?: number;
  /** Base URL for the API (default: https://api.cakewalk.ai) */
  baseUrl?: string;
}

export interface BlogClientConfig {
  /** Your organization API key */
  apiKey: string;
  /** The project ID to fetch posts from */
  projectId: string;
  /** Optional client configuration */
  options?: ClientOptions;
}

export interface CacheEntry<T> {
  data: T;
  expires: number;
}
