# Technical Specification: Browser History Content Feed Generator

## Overview
A Next.js application that analyzes Chrome browsing history, extracts content from visited pages, and generates a personalized feed with related content recommendations using the Exa API.

## System Architecture

### Frontend (Next.js)
- React-based UI with server-side rendering
- TailwindCSS for styling
- Client-side state management using Zustand
- Local storage for persistent data

### Backend (Next.js API Routes)
- SQLite3 integration for Chrome history access
- Content extraction service
- Exa API integration for content discovery
- Local file system storage for cached content

## Core Components

### History Analyzer
- Location: `src/services/history-analyzer.ts`
- Functionality:
  - Reads Chrome SQLite database
  - Filters and processes browsing history
  - Extracts meaningful patterns and interests
  - Caches results locally

```typescript
interface HistoryEntry {
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
}

interface AnalyzedHistory {
  entries: HistoryEntry[];
  patterns: BrowsingPattern[];
  interests: string[];
}
```

### Content Extractor
- Location: `src/services/content-extractor.ts`
- Functionality:
  - Fetches page content
  - Parses HTML using Cheerio
  - Extracts relevant text and metadata
  - Handles different content types (articles, blogs, etc.)

```typescript
interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    tags?: string[];
  };
}
```

### Exa Integration
- Location: `src/services/exa-service.ts`
- Functionality:
  - Integrates with Exa API
  - Finds similar content based on extracted patterns
  - Implements randomization algorithm
  - Caches API responses

```typescript
interface ExaConfig {
  apiKey: string;
  baseUrl: string;
  maxResults: number;
}

interface SimilarContent {
  url: string;
  title: string;
  similarity: number;
  source: string;
}
```

### Feed Generator
- Location: `src/services/feed-generator.ts`
- Functionality:
  - Combines history analysis and content discovery
  - Generates personalized feed
  - Implements caching and pagination
  - Handles content refresh

## Data Models

### Local Storage Schema
```typescript
interface LocalState {
  lastSync: number;
  interests: string[];
  cachedContent: Record<string, ExtractedContent>;
  feedPreferences: FeedPreferences;
}

interface FeedPreferences {
  refreshInterval: number;
  contentTypes: string[];
  maxItems: number;
}
```

### SQLite Integration
```typescript
const HISTORY_QUERY = `
  SELECT url, title, visit_count, last_visit_time
  FROM urls
  ORDER BY last_visit_time DESC
`;

interface DatabaseConfig {
  path: string;
  maxConnections: number;
  timeout: number;
}
```

## API Routes

### History Analysis
- `POST /api/analyze-history`
  - Triggers history analysis
  - Returns analyzed patterns and interests

### Content Management
- `GET /api/content/:url`
  - Fetches and extracts content for specific URL
- `POST /api/content/bulk`
  - Processes multiple URLs in batch

### Feed Generation
- `GET /api/feed`
  - Returns personalized content feed
  - Supports pagination and filtering
- `POST /api/feed/refresh`
  - Forces feed refresh
  - Updates recommendations

## Security Considerations

### Data Privacy
- All data stored locally
- No external data transmission except for Exa API
- Secure handling of Chrome history database
- Content extraction respects robots.txt

### Error Handling
- Graceful failure for database access
- Retry mechanism for content extraction
- API rate limiting
- Error logging and monitoring

## Implementation Plan

### Phase 1: Core Infrastructure
1. Set up Next.js project with TypeScript
2. Implement SQLite integration
3. Create basic content extraction
4. Set up local state management

### Phase 2: Content Processing
1. Implement full content extraction
2. Add Exa API integration
3. Develop feed generation logic
4. Implement caching system

### Phase 3: UI/UX
1. Design and implement feed interface
2. Add content preview
3. Implement preferences management
4. Add analytics dashboard

## Development Setup

### Prerequisites
- Node.js 18+
- SQLite3
- Chrome browser installed
- Exa API key

### Environment Variables
```bash
NEXT_PUBLIC_EXA_API_KEY=your_api_key
CHROME_HISTORY_PATH=/Users/gdc/Library/Application Support/Google/Chrome/Default
FEED_REFRESH_INTERVAL=3600
MAX_CACHED_ITEMS=1000
```

### Local Development
```bash
npm install
npm run dev
```

## Testing Strategy

### Unit Tests
- Service layer testing
- API route testing
- Data model validation

### Integration Tests
- Database integration
- Content extraction
- Feed generation
- API integration

### E2E Tests
- User flow testing
- Feed interaction
- Preference management

## Performance Considerations

### Optimization Strategies
- Implement incremental static regeneration
- Use efficient SQLite queries
- Implement content caching
- Optimize API calls to Exa
- Use web workers for heavy processing

### Monitoring
- Response time tracking
- Error rate monitoring
- Cache hit/miss ratio
- API usage metrics