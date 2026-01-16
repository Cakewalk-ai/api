# @cakewalk-ai/api

Official TypeScript client for the [Cakewalk](https://cakewalk.ai) API with built-in caching.

## Installation

```bash
npm install @cakewalk-ai/api
```

## Getting Your API Key

Get your API key from [app.cakewalk.ai/aeo/settings](https://app.cakewalk.ai/aeo/settings). Your project ID can be found in the same settings page.

## Quick Start

```typescript
import { AEO } from '@cakewalk-ai/api';

const client = new AEO.BlogClient({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
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
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
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
  meta_title: string | null;
  meta_description: string | null;
  featured_image_url: string | null;
  ai_summary: string | null;
  faq_questions: Array<{ question: string; answer: string }>;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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
import type { Post, PostsResponse } from '@cakewalk-ai/api';
```

## License

MIT
