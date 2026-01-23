# @cakewalk-ai/api

Official TypeScript client for the [Cakewalk](https://cakewalk.ai) API with built-in caching.

## Installation

```bash
npm install @cakewalk-ai/api
```

## Getting Your API Key

Get your API key and project ID from [app.cakewalk.ai/keys](https://app.cakewalk.ai/keys).

## Quick Start

```typescript
import { AEO } from '@cakewalk-ai/api';

const client = new AEO.BlogClient({
  apiKey: 'ck_live_...',
  projectId: 'proj_abc123...',
});

// Get published posts (cached automatically)
const { posts, pagination } = await client.getPosts();

// Get posts with options
const { posts } = await client.getPosts({
  status: 'published',
  limit: 10,
  offset: 0,
});

// Get single post by slug
const post = await client.getPostBySlug('my-post-slug');

// Get single post by ID
const post = await client.getPostById(123);
```

## Configuration

```typescript
const client = new AEO.BlogClient({
  apiKey: 'ck_live_...',
  projectId: 'proj_abc123...',
  options: {
    cacheTtl: 600,  // Cache TTL in seconds (default: 300)
    baseUrl: 'https://api.cakewalk.ai',  // Custom API URL
  },
});
```

## API Reference

### `getPosts(options?)`

Get paginated list of posts.

```typescript
const { posts, pagination } = await client.getPosts({
  status: 'published',  // 'published' | 'planned' | 'writing' | 'review' | 'all'
  limit: 50,            // Max 100
  offset: 0,
});

// pagination: { total, limit, offset, has_more }
```

### `getPostBySlug(slug)`

Get a single post by slug.

```typescript
const post = await client.getPostBySlug('how-to-optimize-for-ai');
// Returns: Post | null
```

### `getPostById(id)`

Get a single post by ID.

```typescript
const post = await client.getPostById(123);
// Returns: Post | null
```

### `clearCache()`

Clear the entire cache.

```typescript
client.clearCache();
```

## Post Object

```typescript
interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  post_type: string;       // 'pillar' | 'cluster' | 'standalone'
  post_format: string;     // 'ultimate-guide' | 'how-to' | 'comparison' | etc.
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

interface Author {
  name: string | null;
  title: string | null;
  photo_url: string | null;
  url: string | null;
  bio: string | null;
  byline: string | null;
}
```

## Structured Content

Posts include `structured_content` with typed sections for rich content rendering and schema generation:

```typescript
interface StructuredContent {
  meta?: {
    title: string;
    description: string;
    excerpt?: string;
  };
  sections: ContentSection[];
  citations?: Array<{ text: string; source_url: string }>;
}

// Section types
type ContentSection =
  | { type: 'intro'; content: string }
  | { type: 'heading'; heading: string; level: 2 | 3; content?: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'faq'; question: string; answer: string }
  | { type: 'how_to_step'; step: number; title: string; description: string }
  | { type: 'key_takeaways'; facts: string[] };
```

### Working with Structured Content

```typescript
const post = await client.getPostBySlug('how-to-bake-a-cake');

if (post?.structured_content) {
  // Extract FAQs for a FAQ component
  const faqs = post.structured_content.sections
    .filter((s): s is FAQSection => s.type === 'faq');

  // Extract how-to steps for a step-by-step guide
  const steps = post.structured_content.sections
    .filter((s): s is HowToStepSection => s.type === 'how_to_step');

  // Get intro paragraph
  const intro = post.structured_content.sections
    .find((s): s is IntroSection => s.type === 'intro');
}

// Embed JSON-LD schemas for SEO
if (post?.schema_json_ld) {
  // Array of schema objects (Article, FAQPage, HowTo, etc.)
  post.schema_json_ld.forEach(schema => {
    // Render as <script type="application/ld+json">
  });
}
```

## Caching

All API responses are cached in-memory by default for 5 minutes. This reduces API calls and improves performance.

- Cache is per-client instance
- TTL is configurable via `cacheTtl` option
- Use `clearCache()` to force fresh data

## TypeScript

Full TypeScript support with exported types:

```typescript
import { AEO } from '@cakewalk-ai/api';
import type {
  Post,
  PostsResponse,
  StructuredContent,
  ContentSection,
  FAQSection,
  HowToStepSection,
} from '@cakewalk-ai/api';
```

## License

MIT
