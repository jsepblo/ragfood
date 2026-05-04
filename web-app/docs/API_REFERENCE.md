# API Reference

## REST API Endpoints

### Query Endpoint

**POST** `/api/query`

Process a food-related question using RAG system.

#### Request

**Content-Type:** `application/json`

```json
{
  "question": "What are healthy Mediterranean dishes?",
  "model": "llama-3.1-8b-instant"
}
```

**Parameters:**
- `question` (string, required): The food-related question
- `model` (string, optional): LLM model to use
  - `llama-3.1-8b-instant` (default) - Faster, lower latency
  - `llama-3.1-70b-versatile` - More capable, slower

#### Response

**Status:** 200 OK

```json
{
  "question": "What are healthy Mediterranean dishes?",
  "answer": "Mediterranean cuisine emphasizes fresh vegetables, healthy oils, and lean proteins. Popular healthy options include Greek salad with olive oil, grilled fish with herbs, chickpea soups, and whole grain wraps filled with vegetables and proteins...",
  "sources": [
    {
      "id": "42",
      "text": "Greek Salad: A traditional Mediterranean dish made from fresh tomatoes, cucumbers, red onions, Kalamata olives, and feta cheese...",
      "metadata": {
        "id": "42",
        "region": "Greece",
        "type": "Salad",
        "dietary_tags": ["vegetarian", "gluten-free"],
        "nutrition": "High fiber, vitamin C, healthy fats"
      }
    },
    {
      "id": "43",
      "text": "Grilled Mediterranean Fish: Fresh fish seasoned with herbs and olive oil...",
      "metadata": {
        "id": "43",
        "region": "Mediterranean Region",
        "type": "Main Course",
        "dietary_tags": ["high-protein", "low-carb"]
      }
    }
  ],
  "model": "llama-3.1-8b-instant"
}
```

#### Error Response

**Status:** 400 Bad Request
```json
{
  "error": "Question is required"
}
```

**Status:** 500 Internal Server Error
```json
{
  "error": "Failed to process query"
}
```

## SDK Integration

### JavaScript/TypeScript

```typescript
interface QueryRequest {
  question: string;
  model?: "llama-3.1-8b-instant" | "llama-3.1-70b-versatile";
}

interface QueryResponse {
  question: string;
  answer: string;
  sources: Source[];
  model: string;
}

interface Source {
  id: string;
  text: string;
  metadata: {
    region?: string;
    type?: string;
    dietary_tags?: string[];
    nutrition?: string;
    cultural_story?: string;
  };
}

async function queryFoodRAG(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Query failed");
  }

  return response.json();
}

// Usage
const result = await queryFoodRAG({
  question: "What are healthy Mediterranean dishes?",
  model: "llama-3.1-8b-instant",
});

console.log(result.answer);
console.log(result.sources);
```

### Python

```python
import requests
import json

API_URL = "https://your-app.vercel.app/api/query"

def query_food_rag(question: str, model: str = "llama-3.1-8b-instant"):
    response = requests.post(
        API_URL,
        json={
            "question": question,
            "model": model
        }
    )
    
    if response.status_code != 200:
        raise Exception(f"Query failed: {response.text}")
    
    return response.json()

# Usage
result = query_food_rag("What are healthy Mediterranean dishes?")
print(result["answer"])
for source in result["sources"]:
    print(f"- {source['text'][:100]}...")
```

### cURL

```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are healthy Mediterranean dishes?",
    "model": "llama-3.1-8b-instant"
  }'
```

## Rate Limiting

### Limits
- **Requests/Minute**: 60 (per IP)
- **Concurrent Requests**: 10
- **Request Timeout**: 30 seconds

### Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
```

## Models

### Available Models

#### Llama 3.1 8B (Default)
```
ID: llama-3.1-8b-instant
Speed: ~800-1000ms
Quality: Good
Best for: General queries, fast responses
```

#### Llama 3.1 70B
```
ID: llama-3.1-70b-versatile
Speed: ~2000-3000ms
Quality: Excellent
Best for: Complex queries, detailed answers
```

## Food Database

### Available Categories

1. **World Cuisines** (45+ items)
   - Asian specialties
   - European dishes
   - African foods
   - American classics

2. **Health-Focused** (6 items)
   - Low-calorie options
   - High-protein meals
   - Gluten-free dishes

3. **Comfort Foods** (6 items)
   - Cultural staples
   - Traditional recipes
   - Celebration dishes

4. **Specialty Categories**
   - Vegetarian/Vegan
   - Keto-friendly
   - Mediterranean
   - Asian cuisines

### Metadata Fields

Each food item contains:
- `id`: Unique identifier
- `text`: Full description
- `region`: Geographic origin
- `type`: Category (Salad, Main Course, Dessert, etc.)
- `dietary_tags`: Dietary information
- `nutrition`: Nutritional profile
- `cultural_story`: Cultural context

## Webhooks (Planned)

### Query Webhook
Receive POST request when query completes.

```json
{
  "event": "query.completed",
  "query_id": "q_123456",
  "question": "...",
  "response_time_ms": 1234,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Examples

### Example 1: Basic Query
```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is risotto?"}'
```

### Example 2: Model Selection
```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the history of pasta",
    "model": "llama-3.1-70b-versatile"
  }'
```

### Example 3: Complex Query
```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What vegetarian high-protein meals can I prepare in under 30 minutes?"
  }'
```

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing/invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service down |

## Versioning

Current API version: **v1**

Future versions will be accessed via `/api/v2/query`

## Deprecation Policy

- 6 months notice before deprecating endpoints
- Legacy endpoints supported for 1 year minimum
- New versions released quarterly

## Support

For API issues:
1. Check this documentation
2. Review response status codes
3. Check Vercel logs
4. Open GitHub issue

---

**Last Updated:** May 2024
**API Version:** 1.0
