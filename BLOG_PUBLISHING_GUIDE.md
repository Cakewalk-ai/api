# Blog Publishing Guide

A reference guide for publishing blog posts via the Blog API, including content structure, schema markup, and LLM optimization.

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Post Data Structure](#post-data-structure)
3. [Required vs Optional Fields](#required-vs-optional-fields)
4. [Schema Markup (SEO)](#schema-markup-seo)
5. [LLM Optimization](#llm-optimization)
6. [Content Best Practices](#content-best-practices)
7. [FAQ Structure](#faq-structure)
8. [Author Information](#author-information)

---

## API Overview

### Authentication

The Blog API uses Bearer token authentication with project identification.

**Required Environment Variables:**
```bash
BLOG_API_KEY=your-api-key
BLOG_PROJECT_ID=your-project-id
BLOG_API_URL=https://api.yourblog.com  # Optional, defaults to this
```

**Request Headers:**
```
Authorization: Bearer {BLOG_API_KEY}
Content-Type: application/json
X-Project-ID: {BLOG_PROJECT_ID}
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts with pagination |
| GET | `/posts/{id}` | Get post by ID |
| GET | `/posts/slug/{slug}` | Get post by slug |

### Query Parameters for `/posts`

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `published`, `planned`, `writing`, `review` |
| `limit` | number | Max posts to return (max 100) |
| `offset` | number | Pagination offset |

---

## Post Data Structure

### Complete Post Object

```typescript
interface Post {
  // Core identification
  id: number                    // Unique post ID
  title: string                 // Post title (required)
  slug: string                  // URL-friendly identifier (required)

  // Status and classification
  status: string                // 'published' | 'planned' | 'writing' | 'review'
  post_type: string             // 'pillar' | 'cluster' | 'standalone'
  post_format: string           // Content format identifier

  // SEO keywords
  primary_keyword: string       // Main target keyword
  secondary_keywords: string[]  // Supporting keywords (become tags)

  // Content
  excerpt: string | null        // Short summary for listings
  body_markdown: string | null  // Markdown source
  body_html: string | null      // Rendered HTML (used for display)
  ai_summary: string | null     // AI-generated summary (fallback for excerpt)

  // SEO metadata
  meta_title: string | null     // Custom title for search engines
  meta_description: string | null // Custom description for search engines
  featured_image_url: string | null // Hero/OG image URL

  // FAQ content
  faq_questions: FAQQuestion[]  // Structured Q&A pairs

  // Timestamps
  published_at: string | null   // ISO 8601 publication date
  created_at: string | null     // ISO 8601 creation date
  updated_at: string | null     // ISO 8601 last update

  // Author
  author: Author | null         // Author details object

  // Extended schema data
  schema_data?: SchemaData      // Rich structured data
}
```

### Author Object

```typescript
interface Author {
  name: string | null           // Display name
  title: string | null          // Job title (e.g., "SEO Director")
  photo_url: string | null      // Avatar image URL
  bio: string | null            // Short biography
  byline: string | null         // Custom byline text
  url: string | null            // Profile/website URL
}
```

### Schema Data Object

```typescript
interface SchemaData {
  article_type?: string         // e.g., "BlogPosting", "HowTo", "Article"
  word_count?: number           // Total word count
  reading_time_minutes?: number // Estimated reading time
  last_modified?: string        // ISO 8601 last modification date

  // Navigation breadcrumbs
  breadcrumbs?: Array<{
    name: string                // Display name
    url: string                 // Link URL
  }>

  // How-to steps (for tutorial content)
  how_to_steps?: Array<{
    name: string                // Step title
    text: string                // Step description
    image?: string              // Optional step image URL
  }>

  // Related content links
  related_articles?: Array<{
    title: string               // Article title
    url: string                 // Article URL (can be relative slug)
  }>
}
```

### FAQ Question Object

```typescript
interface FAQQuestion {
  question: string              // The question text
  answer: string                // The answer text
}
```

---

## Required vs Optional Fields

### Required for Publication

| Field | Purpose |
|-------|---------|
| `title` | Post headline, used in H1 and meta tags |
| `slug` | URL path segment (must be unique) |
| `status` | Must be `published` to appear on site |
| `body_html` | Rendered content for display |

### Highly Recommended

| Field | Purpose |
|-------|---------|
| `meta_title` | SEO-optimized title (can differ from display title) |
| `meta_description` | Search engine snippet text |
| `excerpt` | Used in blog listings and social sharing |
| `primary_keyword` | Main SEO target |
| `secondary_keywords` | Tags and supporting SEO terms |
| `published_at` | Publication date for chronological sorting |
| `author` | Attribution and E-E-A-T signals |

### Optional but Valuable

| Field | Purpose |
|-------|---------|
| `featured_image_url` | Hero image and OG image for social |
| `faq_questions` | Enables FAQPage schema markup |
| `schema_data` | Rich structured data for search features |
| `post_type` | `pillar` posts are marked as featured |
| `ai_summary` | Fallback for missing excerpt |

---

## Schema Markup (SEO)

The site automatically generates JSON-LD structured data for each blog post. Understanding these schemas helps you provide the right data.

### 1. BreadcrumbList

Generated automatically from URL structure.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yourblog.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://yourblog.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Post Title", "item": "https://yourblog.com/blog/slug" }
  ]
}
```

**Data needed:** `title` or `meta_title`, `slug`

### 2. BlogPosting (Article)

Main article schema for search engines.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "meta_title or title",
  "description": "meta_description or excerpt",
  "image": "featured_image_url",
  "datePublished": "published_at (ISO 8601)",
  "dateModified": "published_at (ISO 8601)",
  "author": {
    "@type": "Person",
    "name": "author.name",
    "url": "author.url",
    "image": "author.photo_url",
    "jobTitle": "author.title"
  },
  "publisher": {
    "@type": "Organization",
    "name": "YOUR BLOG",
    "logo": { "@type": "ImageObject", "url": "favicon.png" }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "canonical_url"
  },
  "keywords": "secondary_keywords joined by comma"
}
```

**Data needed:** `title`, `meta_title`, `meta_description`, `excerpt`, `featured_image_url`, `published_at`, `author`, `secondary_keywords`

### 3. FAQPage

Only generated when post has FAQ questions with both question AND answer.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer Engine Optimization is..."
      }
    }
  ]
}
```

**Data needed:** `faq_questions` array with complete Q&A pairs

### 4. Speakable

Marks content suitable for text-to-speech (voice search).

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".prose", "article header h1"]
  },
  "url": "canonical_url"
}
```

**Data needed:** None (automatic based on content structure)

---

## LLM Optimization

The site auto-generates `/llms.txt` at build time to help LLMs understand and cite the content.

### How llms.txt is Generated

1. **Site info** from `config.json`:
   - Name, domain, description, tagline
   - Social links (Twitter, LinkedIn)

2. **Services/Features** from config:
   - `llms.whatWeDo` array (custom)
   - Falls back to `valueProps` or `services`

3. **Topics** from blog content:
   - `llms.topics` array (custom)
   - Falls back to top 10 most-used `secondary_keywords` from all posts

4. **Featured Content**:
   - Posts with `post_type: 'pillar'` (marked as featured)
   - Falls back to 5 most recent posts

### Optimizing Posts for LLM Citation

To maximize the chance of your content being cited by AI assistants:

| Strategy | Implementation |
|----------|----------------|
| **Clear structure** | Use descriptive headings (H2, H3) that summarize section content |
| **Authoritative answers** | Start paragraphs with direct answers to likely questions |
| **Keyword presence** | Include `primary_keyword` naturally in title, intro, and headings |
| **Tag coverage** | Use relevant `secondary_keywords` to indicate topic coverage |
| **FAQ sections** | Provide complete `faq_questions` with concise answers |
| **Pillar content** | Mark comprehensive guides as `post_type: 'pillar'` |
| **Fresh dates** | Keep `published_at` current for time-sensitive topics |

### llms.txt Custom Configuration

Add to project `config.json`:

```json
{
  "llms": {
    "about": "One paragraph describing what the site/company does",
    "whatWeDo": [
      { "title": "Service Name", "description": "What this service does" }
    ],
    "topics": [
      "Topic 1",
      "Topic 2"
    ]
  }
}
```

---

## Content Best Practices

### HTML Content Transformation

The site automatically processes `body_html`:

1. **List conversion**: `* Item` patterns become proper `<ul><li>` tags
2. **Numbered lists**: Inline `1. First 2. Second` become `<ol>` tags
3. **Internal links**: Relative slugs like `href="other-post"` become `href="/blog/other-post"`

### Recommended Content Structure

```html
<!-- Intro paragraph with primary keyword -->
<p>Clear introduction that answers the main question...</p>

<!-- Table of contents (optional, auto-linked) -->
<h2>Table of Contents</h2>
<ul>
  <li><a href="#section-1">Section 1</a></li>
</ul>

<!-- Main sections with descriptive headings -->
<h2 id="section-1">What is [Primary Keyword]?</h2>
<p>Direct answer followed by elaboration...</p>

<!-- Subsections as needed -->
<h3>Key Benefits</h3>
<ul>
  <li><strong>Benefit 1</strong>: Explanation</li>
</ul>

<!-- FAQ section (triggers schema) -->
<h2>Frequently Asked Questions</h2>
<p><strong>Question 1?</strong> Answer 1.</p>
<p><strong>Question 2?</strong> Answer 2.</p>
```

### Image Best Practices

| Field | Recommendation |
|-------|----------------|
| `featured_image_url` | 1200x630px for optimal OG display |
| Format | WebP or optimized JPEG |
| Alt text | Include in HTML content, describe image purpose |

---

## FAQ Structure

FAQs power both the FAQPage schema and the visual FAQ section.

### Complete Q&A Format (Recommended)

```json
{
  "faq_questions": [
    {
      "question": "What is Answer Engine Optimization?",
      "answer": "Answer Engine Optimization (AEO) is the practice of optimizing content to be cited by AI assistants like ChatGPT, Perplexity, and Gemini."
    },
    {
      "question": "How long until I see results?",
      "answer": "Most users see first AI citations within 2-4 weeks of publishing optimized content."
    }
  ]
}
```

### In-Content FAQ (Alternative)

If FAQs are embedded in `body_html`, use this pattern:

```html
<h2>Frequently Asked Questions</h2>
<p><strong>Question text here?</strong> Answer text here.</p>
```

The site will detect and style these automatically.

### FAQ Guidelines

- Keep questions under 100 characters
- Provide complete, self-contained answers
- Use the exact phrasing users might ask
- Include 3-7 FAQs per post for optimal schema

---

## Author Information

Author data improves E-E-A-T signals and visual presentation.

### Complete Author Object

```json
{
  "author": {
    "name": "Jane Smith",
    "title": "SEO Director",
    "photo_url": "https://example.com/jane-photo.jpg",
    "bio": "Jane has 10 years of experience in search optimization and leads the SEO team.",
    "byline": "SEO expert and content strategist",
    "url": "https://linkedin.com/in/janesmith"
  }
}
```

### Display Usage

| Field | Where it appears |
|-------|------------------|
| `name` | Article byline, schema markup |
| `title` | Below name in author card, schema `jobTitle` |
| `photo_url` | Author avatar in blog list and post header |
| `bio` | Author section at bottom of posts |
| `byline` | Alternative short description |
| `url` | Links author name to external profile |

---

## Quick Reference: Minimum Viable Post

For a post to display correctly and have good SEO:

```json
{
  "title": "Your Post Title",
  "slug": "your-post-slug",
  "status": "published",
  "body_html": "<p>Your content here...</p>",
  "excerpt": "A 1-2 sentence summary of the post.",
  "meta_title": "SEO Title | YOUR BLOG",
  "meta_description": "Meta description for search results (150-160 chars).",
  "primary_keyword": "main keyword",
  "secondary_keywords": ["tag1", "tag2", "tag3"],
  "published_at": "2024-01-15T10:00:00Z",
  "author": {
    "name": "Author Name"
  }
}
```

## Quick Reference: Fully Optimized Post

For maximum SEO, LLM citation potential, and rich search features:

```json
{
  "title": "Complete Guide to Answer Engine Optimization in 2024",
  "slug": "answer-engine-optimization-guide-2024",
  "status": "published",
  "post_type": "pillar",
  "body_html": "<p>Content with proper headings, lists, and FAQ section...</p>",
  "excerpt": "Learn how to optimize your content for AI assistants and get cited by ChatGPT, Perplexity, and Gemini.",
  "meta_title": "Answer Engine Optimization Guide 2024 | AEO Best Practices",
  "meta_description": "Master AEO with our complete guide. Learn how to get your content cited by ChatGPT, Perplexity, and Gemini in 2024.",
  "primary_keyword": "answer engine optimization",
  "secondary_keywords": ["AEO", "AI SEO", "ChatGPT optimization", "Perplexity SEO", "AI citations"],
  "featured_image_url": "https://example.com/aeo-guide-hero.jpg",
  "published_at": "2024-01-15T10:00:00Z",
  "author": {
    "name": "Jane Smith",
    "title": "SEO Director",
    "photo_url": "https://example.com/jane.jpg",
    "bio": "Jane leads SEO strategy with 10 years of search experience.",
    "url": "https://linkedin.com/in/janesmith"
  },
  "faq_questions": [
    {
      "question": "What is Answer Engine Optimization?",
      "answer": "Answer Engine Optimization (AEO) is the practice of structuring content to be cited by AI assistants like ChatGPT and Perplexity when they answer user questions."
    },
    {
      "question": "How is AEO different from SEO?",
      "answer": "While SEO focuses on ranking in traditional search results, AEO focuses on being selected as a source when AI assistants generate responses."
    }
  ],
  "schema_data": {
    "article_type": "BlogPosting",
    "word_count": 2500,
    "reading_time_minutes": 12,
    "related_articles": [
      { "title": "AI SEO Tools Comparison", "url": "ai-seo-tools-comparison" },
      { "title": "Getting Started with AEO", "url": "getting-started-aeo" }
    ]
  }
}
```
