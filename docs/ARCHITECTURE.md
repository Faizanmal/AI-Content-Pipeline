# Architecture Documentation

## System Overview

The  AI Content Enhancement Pipeline is a multi-stack application that:

1. **Scrapes** blog articles from  website
2. **Stores** them in a database via Laravel APIs
3. **Enhances** content using AI (OpenAI GPT-4) based on top-ranking Google results
4. **Displays** both original and enhanced articles in a modern React frontend

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | Laravel 11 (PHP 8.2+) | REST API, Database, Scraping |
| Automation | Node.js 18+ | AI Enhancement Pipeline |
| Frontend | React 18 | User Interface |
| Database | MySQL/PostgreSQL | Data Storage |
| AI | OpenAI GPT-4 | Content Enhancement |
| Search | SerpAPI/Google API | Finding Reference Articles |

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                          (React.js @ :3000)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Article List  │  │  Article Detail │  │   Components    │              │
│  │   - Filtering   │  │  - Full Content │  │   - Header      │              │
│  │   - Pagination  │  │  - References   │  │   - Cards       │              │
│  │   - Badges      │  │  - Navigation   │  │   - Loading     │              │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘              │
│           │                    │                                             │
│           └────────────────────┴─────────────────────────────────────────────┤
│                                    │                                         │
│                                    │  HTTP/REST API                          │
│                                    ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                              BACKEND                                         │
│                          (Laravel @ :8000)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Controllers   │  │    Services     │  │      Jobs       │              │
│  │   - Articles    │  │   - Article     │  │   - Scraping    │              │
│  │   - CRUD APIs   │  │   - Scraper     │  │                 │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│           └────────────────────┴────────────────────┘                        │
│                                │                                             │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         MySQL/PostgreSQL                            │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  articles                                                      │  │    │
│  │  │  - id, title, slug, content, author, published_date           │  │    │
│  │  │  - original_article_id (FK), version_type, status, metadata   │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │  HTTP/REST API
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTOMATION SERVICE                                  │
│                              (Node.js)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Enhancement Pipeline                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ Fetch   │─▶│ Search  │─▶│ Scrape  │─▶│ Enhance │─▶│ Publish │   │   │
│  │  │ Article │  │ Google  │  │ Content │  │ w/ LLM  │  │ Result  │   │   │
│  │  └─────────┘  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘   │   │
│  │                    │            │            │                      │   │
│  │                    ▼            ▼            ▼                      │   │
│  │              ┌─────────┐  ┌─────────┐  ┌─────────┐                 │   │
│  │              │ SerpAPI │  │ Cheerio │  │ OpenAI  │                 │   │
│  │              │ Google  │  │ Parser  │  │ GPT-4   │                 │   │
│  │              └─────────┘  └─────────┘  └─────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Content Scraping Flow

```
 Blog ──▶ Laravel Scraper ──▶ Database
                     (Job Queue)          (Original Articles)
```

### 2. Content Enhancement Flow

```
Database ──▶ Node.js ──▶ Google Search ──▶ Scrape URLs ──▶ OpenAI ──▶ Database
(Original)   Service      (SerpAPI)       (Cheerio)       (GPT-4)    (Enhanced)
```

### 3. Content Display Flow

```
Database ──▶ Laravel API ──▶ React Frontend ──▶ User Browser
```

## API Design

### RESTful Endpoints

```
GET    /api/articles          List articles (paginated, filterable)
POST   /api/articles          Create article
GET    /api/articles/{id}     Get single article
PUT    /api/articles/{id}     Update article
DELETE /api/articles/{id}     Delete article
GET    /api/articles/latest   Get latest original article
POST   /api/articles/scrape   Trigger scraping job
```

### Request/Response Format

All API responses follow this structure:

```json
{
  "data": { ... },
  "message": "Success message",
  "meta": {
    "total": 100,
    "per_page": 15,
    "current_page": 1
  }
}
```

## Database Schema

### Articles Table

```sql
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    published_date DATE,
    author VARCHAR(255),
    content LONGTEXT NOT NULL,
    source_url VARCHAR(500),
    original_article_id BIGINT REFERENCES articles(id),
    version_type ENUM('original', 'updated') DEFAULT 'original',
    status ENUM('draft', 'published') DEFAULT 'draft',
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_version_type (version_type),
    INDEX idx_status (status),
    INDEX idx_published_date (published_date)
);
```

## Security Considerations

1. **API Authentication**: Consider adding Laravel Sanctum for API tokens
2. **CORS**: Configured for specific frontend origins
3. **Input Validation**: All requests validated via Form Requests
4. **SQL Injection**: Protected via Eloquent ORM
5. **XSS**: Content sanitized, React escapes by default
6. **Rate Limiting**: Implement API rate limiting for production

## Scalability Considerations

1. **Queue Workers**: Laravel jobs can scale horizontally
2. **Caching**: Add Redis caching for frequently accessed articles
3. **CDN**: Serve React build via CDN
4. **Database**: Consider read replicas for high traffic
5. **API Gateway**: Add load balancing for production

## Deployment Checklist

### Laravel Backend
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure production database
- [ ] Run `php artisan optimize`
- [ ] Set up queue worker supervisor
- [ ] Configure proper CORS origins

### Node.js Automation
- [ ] Set `NODE_ENV=production`
- [ ] Secure API keys in environment
- [ ] Set up scheduled task (cron) for automation
- [ ] Configure log rotation

### React Frontend
- [ ] Run `npm run build`
- [ ] Deploy to static hosting (Vercel, Netlify, S3)
- [ ] Configure production API URL
- [ ] Enable HTTPS
