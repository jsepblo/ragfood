# RAG-Food Cloud Migration Plan

## Executive Summary
This document outlines the migration of the Week 2 local RAG system to a cloud-based infrastructure using Upstash Vector Database and Groq API. The migration aims to improve scalability, reduce latency, and enhance the system's capabilities while maintaining the core RAG functionality.

## Current System Architecture (Local Version)
- **Vector Database**: ChromaDB (local)
- **Embeddings**: Ollama mxbai-embed-large (local)
- **LLM**: Ollama llama3.2 (local)
- **Data**: 75 food items in JSON format
- **Deployment**: Local Python script

### Limitations of Current System
- Requires local Ollama installation and models
- ChromaDB persistence requires local storage
- Limited scalability for concurrent users
- Manual embedding generation process
- No cloud-based redundancy or backup

## Target System Architecture (Cloud Version)

### Cloud Infrastructure Components
- **Vector Database**: Upstash Vector Database
  - Database Name: `rag-food-advanced-[yourname]`
  - Region: [Closest to user location]
  - Embedding Model: `mixedbread-ai/mxbai-embed-large-v1`
  - Similarity Function: Cosine
- **LLM Service**: Groq Cloud API
  - Model: `llama3-8b-8192` or similar
- **Environment Management**: Vercel (for deployment)
- **Configuration**: Environment variables via .env file

### Architecture Diagram
```
User Query → Cloud RAG System
                    ↓
            ┌─────────────────┐
            │   Groq API      │ ← LLM for answer generation
            │   (Cloud)       │
            └─────────────────┘
                    ↑
            ┌─────────────────┐
            │ Upstash Vector  │ ← Vector similarity search
            │   Database      │
            │   (Cloud)       │
            └─────────────────┘
                    ↑
            ┌─────────────────┐
            │   Enhanced      │
            │   Food Data     │ ← 95+ food items with rich metadata
            │   (JSON)        │
            └─────────────────┘
```

## Migration Strategy

### Phase 1: Infrastructure Setup
1. **Create Vercel Account**
   - Sign up with GitHub authentication
   - Set up project repository

2. **Set up Upstash Vector Database**
   - Access via Vercel Storage dashboard
   - Configure database with specified parameters
   - Obtain REST URL and token

3. **Configure Groq Cloud**
   - Create Groq account
   - Generate API key
   - Test API access

4. **Environment Configuration**
   - Create `.env` file with all credentials
   - Implement environment variable validation

### Phase 2: Code Migration

#### Vector Database Migration (ChromaDB → Upstash)
- **Current**: Manual embedding generation + ChromaDB storage
- **Target**: Raw text upload to Upstash (automatic embeddings)
- **Key Changes**:
  - Remove `get_embedding()` function
  - Replace ChromaDB client with Upstash SDK
  - Change data upsert process to use raw text
  - Update query process for Upstash API

#### LLM Migration (Ollama → Groq)
- **Current**: Local Ollama API calls
- **Target**: Groq Cloud API integration
- **Key Changes**:
  - Replace Ollama endpoints with Groq API
  - Update request/response format
  - Implement proper error handling
  - Add retry logic and rate limiting

#### Data Enhancement
- **Current**: 75 basic food items
- **Target**: 95+ comprehensive food items
- **Enhancement Categories**:
  - 8 items from diverse world cuisines
  - 6 health-conscious options with nutrition
  - 6 comfort foods with cultural stories

### Phase 3: Testing & Validation

#### Functional Testing
- **Basic Queries**: Verify core RAG functionality
- **Advanced Queries**: Test semantic search capabilities
- **Error Handling**: Test cloud service failures
- **Performance**: Compare response times

#### Data Quality Testing
- **Semantic Similarity**: Test multi-criteria searches
- **Cultural Exploration**: Verify diverse cuisine coverage
- **Nutritional Queries**: Test health-focused searches
- **Cooking Methods**: Verify preparation technique queries

### Phase 4: Deployment & Documentation

#### Repository Organization
```
/local-version/     # Original ChromaDB system
/cloud-version/     # New Upstash + Groq implementation
/data/             # Enhanced food database
/docs/             # Migration docs and testing results
```

#### Documentation Updates
- Update README.md with cloud setup instructions
- Add performance comparison tables
- Include troubleshooting guides
- Document API usage and limitations

## Risk Assessment & Mitigation

### Technical Risks
1. **API Rate Limits**: Groq API has rate limits
   - Mitigation: Implement retry logic with exponential backoff

2. **Embedding Model Changes**: Upstash uses different embedding model
   - Mitigation: Test embedding quality and adjust similarity thresholds

3. **Data Migration**: Potential data loss during migration
   - Mitigation: Backup all data and test migration process

4. **Cost Management**: Cloud services have usage costs
   - Mitigation: Monitor usage and implement cost controls

### Operational Risks
1. **Service Downtime**: Cloud services may experience outages
   - Mitigation: Implement fallback mechanisms and error handling

2. **API Key Security**: Sensitive credentials in environment
   - Mitigation: Use secure environment variable management

## Success Criteria
- ✅ Functional cloud RAG system with improved performance
- ✅ Successful migration of all 75+ food items
- ✅ Enhanced database with 20+ new culturally diverse items
- ✅ Comprehensive testing with 15+ query types
- ✅ Professional documentation and repository organization
- ✅ Performance improvement over local system

## Timeline
- **Week 1**: Infrastructure setup and basic migration
- **Week 2**: Data enhancement and advanced features
- **Week 3**: Testing, documentation, and deployment
- **Week 4**: Performance optimization and final validation

## Cost Estimation
- **Upstash Vector**: ~$10-20/month (depending on usage)
- **Groq API**: Pay-per-token (estimated $0.01-0.05 per query)
- **Vercel**: Free tier sufficient for demo

## Next Steps
1. Begin infrastructure setup (Vercel, Upstash, Groq)
2. Create cloud-migration branch
3. Implement code migration
4. Enhance food database
5. Comprehensive testing
6. Documentation and deployment

---

*This migration plan was created with AI assistance to ensure comprehensive coverage of all technical and operational considerations.*</content>
<parameter name="filePath">c:\Users\Vince\ragfood\MIGRATION_PLAN.md