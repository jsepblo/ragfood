# Architecture & System Design

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│              (React + Next.js Chat Component)               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓ (HTTP POST)
┌─────────────────────────────────────────────────────────────┐
│                 Next.js API Route                           │
│              (/api/query route handler)                     │
│                                                              │
│  1. Validate input                                          │
│  2. Route request to RAG logic                              │
│  3. Format response                                         │
│  4. Handle errors                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
    ┌────────────┐   ┌──────────────┐
    │ RAG Logic  │   │ Vector Search│
    │ (lib/rag)  │   │  (Upstash)   │
    └─────┬──────┘   └──────────────┘
          │
    ┌─────↓─────────────────────────┐
    │ 1. Query Vector Database      │
    │    - Send question to Upstash │
    │    - Get top 5 similar foods  │
    │    - Extract context         │
    └─────┬──────────────────────────┘
          │
    ┌─────↓──────────────────────────┐
    │ 2. Generate Answer             │
    │    - Build prompt with context │
    │    - Call Groq API            │
    │    - Stream response          │
    └─────┬──────────────────────────┘
          │
    ┌─────↓────────────────────────────┐
    │ 3. Return to Frontend            │
    │    - Answer text                 │
    │    - Source documents           │
    │    - Model used                 │
    └──────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
ChatInterface.tsx (Main Component)
├── State Management
│   ├── messages[]
│   ├── input
│   ├── loading
│   ├── error
│   └── selectedModel
├── UI Sections
│   ├── Header (branding, info)
│   ├── Model Selector
│   ├── Messages Container
│   │   ├── User Messages
│   │   ├── Assistant Messages
│   │   └── Source Attribution
│   ├── Example Queries
│   ├── Error Display
│   └── Input Form
└── Event Handlers
    ├── handleSubmit()
    ├── handleExampleQuery()
    ├── scrollToBottom()
    └── Error handling
```

### Backend API Routes

```
/api/query (POST)
├── Input Validation
│   ├── Check question exists
│   └── Check format valid
├── RAG Processing
│   ├── Vector Search
│   │   ├── Initialize Upstash client
│   │   ├── Query with question
│   │   ├── Get top 5 results
│   │   └── Extract metadata
│   └── Answer Generation
│       ├── Build context from results
│       ├── Create prompt
│       ├── Call Groq API
│       └── Stream response
└── Response Format
    ├── Question echo
    ├── Generated answer
    ├── Source documents
    └── Model name
```

## Data Flow

### Request Flow
```
User Input
    ↓
handleSubmit() event
    ↓
Validate input
    ↓
Add user message to UI
    ↓
POST /api/query
    ↓
Backend processes RAG
    ↓
Return JSON response
    ↓
Parse response
    ↓
Add assistant message + sources
    ↓
Display to user
```

### Search & Generation Flow
```
Vector Search Phase:
  Question → Embeddings (automatic at Upstash)
          ↓
          Vector similarity search
          ↓
          Top 5 food documents retrieved
          ↓
          Extract text and metadata

LLM Generation Phase:
  Question + Context → Format prompt
                      ↓
                      Send to Groq API
                      ↓
                      LLM processes and generates
                      ↓
                      Stream response back
                      ↓
                      Format final answer
```

## Technology Stack Details

### Frontend (React + TypeScript)
- **Components**: Functional components with hooks
- **State**: React useState for local state
- **Styling**: Tailwind CSS with responsive design
- **Icons**: Lucide React for UI icons
- **Type Safety**: TypeScript interfaces

### Backend (Next.js)
- **API Routes**: /app/api/* route handlers
- **Middleware**: Built-in Next.js middleware
- **Environment**: process.env for secrets
- **Database**: Serverless (no local DB needed)

### Cloud Services
- **Vector DB**: Upstash Vector
  - Serverless, no infrastructure
  - Automatic embeddings via mxbai-embed-large-v1
  - REST API for queries
  - Managed backups and scaling

- **LLM**: Groq API
  - Fast inference
  - Multiple models available
  - Pay-per-token pricing
  - Global CDN for low latency

### Deployment
- **Hosting**: Vercel
  - Serverless functions
  - Global CDN
  - Auto-scaling
  - SSL/TLS included

## Database Schema

### Vector Database (Upstash)

```
Food Item Document:
{
  id: "42",
  text: "Greek Salad: A traditional Mediterranean...",
  metadata: {
    id: "42",
    region: "Greece",
    type: "Salad",
    dietary_tags: ["vegetarian", "healthy"],
    nutrition: "Low calorie, high fiber",
    cultural_story: "Traditional dish of ancient Greece"
  },
  vector: [0.234, 0.891, 0.123, ...] // Auto-generated embedding
}
```

### Query Request Structure
```typescript
interface QueryRequest {
  question: string;      // User question
  model: string;        // Selected LLM model
}
```

### Query Response Structure
```typescript
interface QueryResponse {
  question: string;     // Echo of question
  answer: string;       // Generated answer
  sources: Source[];    // Retrieved documents
  model: string;        // Model used
}

interface Source {
  id: string;
  text: string;
  metadata: {
    region?: string;
    type?: string;
    dietary_tags?: string[];
    nutrition?: string;
  };
}
```

## Error Handling

### Try-Catch Flow
```
User Input
    ↓
Try {
  - Validate
  - Query Vector DB → catch network errors
  - Call Groq API → catch rate limits
  - Format response
} Catch {
  - Log error
  - Return error message
  - Display to user
}
```

### Error Types
- **Validation Errors**: Input validation failures
- **Network Errors**: Connection to cloud services
- **Rate Limit Errors**: API quota exceeded
- **Timeout Errors**: Long-running requests
- **Format Errors**: Invalid response format

## Security Architecture

### Secret Management
```
.env.local (Local Dev)
    ↓
.env (Should be in .gitignore)
    ↓
Environment Variables in Code
    ↓
Only used on server-side (Next.js)
    ↓
Never exposed to client
```

### API Security
- Input validation on every request
- Error messages don't expose sensitive info
- CORS headers configured
- Rate limiting ready for production

## Performance Optimization

### Caching Strategy
```
Vector Search Results
    └─ Cache: 10 minutes
    └─ Key: SHA256(question)

LLM Responses
    └─ Not cached (unique responses)
    └─ Stream results for perception of speed

API Responses
    └─ Cache: 5 minutes by Vercel Edge

Frontend Assets
    └─ Automatically optimized by Next.js
    └─ Images: Responsive & lazy-loaded
    └─ CSS: Minified via Tailwind
    └─ JS: Code-split automatically
```

### Response Time Breakdown
```
Request Processing:
  Input Validation: ~10ms
  Vector Search: ~150-300ms
  LLM Inference: ~800-2000ms
  Response Formatting: ~5ms
  Total: ~1000-2300ms
```

## Scaling Considerations

### Current Capacity
- Concurrent users: 100+
- Requests/second: 10+
- QPS (Query Per Second): Limited by Groq API rate

### Scaling Strategy
- **Vertical**: Upgrade to Groq Pro tier
- **Horizontal**: Multiple Vercel deployments
- **Caching**: Add Redis layer (future)
- **Load Balancing**: Vercel handles automatically

## Deployment Architecture

### Local Development
```
npm run dev
    ↓
Next.js dev server (localhost:3000)
    ↓
Hot reload on file changes
    ↓
Access environment variables from .env.local
```

### Production (Vercel)
```
GitHub push
    ↓
Vercel detects change
    ↓
Builds application (npm run build)
    ↓
Deploys to Vercel Edge Network
    ↓
Environment variables injected
    ↓
Live on: https://your-app.vercel.app
```

## Monitoring & Observability

### Vercel Built-in
- Deployment logs
- Function execution time
- Error tracking
- Performance analytics

### Application Monitoring
- API response times
- Error rates
- User queries (anonymized)
- Model usage distribution

## Future Architecture Improvements

1. **Caching Layer**
   - Redis for query results
   - Faster subsequent queries

2. **Analytics Database**
   - PostgreSQL for analytics
   - Track popular queries
   - User behavior analysis

3. **Message Queue**
   - Bull.js for long-running tasks
   - Batch processing

4. **Image Processing**
   - Vision API for food recognition
   - Recipe generation from images

5. **Multi-region**
   - Deploy to multiple regions
   - Lower latency globally
