export interface Author {
  name: string | null;
  title: string | null;
  photo_url: string | null;
  url: string | null;
  bio: string | null;
  byline: string | null;
}

// Structured Content Section Types
export interface IntroSection {
  type: 'intro';
  content: string;
}

export interface HeadingSection {
  type: 'heading';
  heading: string;
  level: 2 | 3;
  content?: string;
}

export interface TableSection {
  type: 'table';
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface FAQSection {
  type: 'faq';
  question: string;
  answer: string;
}

export interface HowToStepSection {
  type: 'how_to_step';
  step: number;
  title: string;
  description: string;
}

export interface KeyTakeawaysSection {
  type: 'key_takeaways';
  facts: string[];
}

export type ContentSection =
  | IntroSection
  | HeadingSection
  | TableSection
  | FAQSection
  | HowToStepSection
  | KeyTakeawaysSection;

export interface Citation {
  text: string;
  source_url: string;
}

export interface StructuredContentMeta {
  title: string;
  description: string;
  excerpt?: string;
}

export interface StructuredContent {
  meta?: StructuredContentMeta;
  sections: ContentSection[];
  citations?: Citation[];
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
  structured_content: StructuredContent | null;
  schema_json_ld: object[] | null;
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
  /** Base URL for the API (default: https://api.cakewalk.ai/api) */
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
