# @cakewalk-ai/aeo-api

Official TypeScript client for the Cakewalk AEO Blog API with built-in caching.

## Installation

```bash
npm install @cakewalk-ai/aeo-api
```

## Quick Start

```typescript
import { BlogClient } from '@cakewalk-ai/aeo-api';

const client = new BlogClient('your-api-key');

// Get articles (cached automatically)
const { articles, total, totalPages } = await client.getArticles(1, 10);

// Get single article
const article = await client.getArticle('my-article-slug');

// Get articles by category
const categoryArticles = await client.getArticlesByCategory('marketing', 1, 10);

// Get articles by tag
const tagArticles = await client.getArticlesByTag('ai-search', 1, 10);
```

## Configuration

```typescript
const client = new BlogClient('your-api-key', {
  cacheTtl: 600,  // Cache TTL in seconds (default: 300)
  baseUrl: 'https://api.cakewalk.ai',  // Custom API URL
});
```

## API Reference

### `getArticles(page?, limit?)`

Get paginated list of articles.

```typescript
const response = await client.getArticles(1, 10);
// Returns: { articles, total, page, limit, totalPages }
```

### `getArticle(slug)`

Get a single article by slug.

```typescript
const article = await client.getArticle('how-to-optimize-for-ai');
// Returns: Article | null
```

### `getArticlesByCategory(categorySlug, page?, limit?)`

Get articles filtered by category.

```typescript
const response = await client.getArticlesByCategory('guides', 1, 10);
```

### `getArticlesByTag(tagSlug, page?, limit?)`

Get articles filtered by tag.

```typescript
const response = await client.getArticlesByTag('chatgpt', 1, 10);
```

### `getCategories()`

Get all available categories.

```typescript
const categories = await client.getCategories();
// Returns: Category[]
```

### `getTags()`

Get all available tags.

```typescript
const tags = await client.getTags();
// Returns: Tag[]
```

### `clearCache()`

Clear the entire cache.

```typescript
client.clearCache();
```

## Caching

All API responses are cached in-memory by default for 5 minutes. This reduces API calls and improves performance.

- Cache is per-client instance
- TTL is configurable via `cacheTtl` option
- Use `clearCache()` to force fresh data

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  Article,
  ArticleSummary,
  ArticlesResponse,
  Category,
  Tag
} from '@cakewalk-ai/aeo-api';
```

## License

MIT
