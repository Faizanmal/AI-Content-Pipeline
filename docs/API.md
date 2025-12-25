# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API is open. For production, implement Laravel Sanctum or Passport.

---

## Endpoints

### List Articles

Retrieve a paginated list of articles.

**Request:**
```
GET /articles
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 15, max: 100) |
| version_type | string | Filter by 'original' or 'updated' |
| status | string | Filter by 'draft' or 'published' |
| search | string | Search in article title |
| author | string | Filter by author name |
| sort_by | string | Sort field (default: created_at) |
| sort_order | string | Sort direction: 'asc' or 'desc' (default: desc) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "published_date": "2024-01-15",
      "author": "John Doe",
      "content": "<p>Article content...</p>",
      "source_url": "https://.com/blogs/article-title",
      "version_type": "original",
      "status": "published",
      "metadata": null,
      "references": [],
      "original_article_id": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4,
    "from": 1,
    "to": 15
  },
  "links": {
    "first": "http://localhost:8000/api/articles?page=1",
    "last": "http://localhost:8000/api/articles?page=4",
    "prev": null,
    "next": "http://localhost:8000/api/articles?page=2"
  }
}
```

---

### Get Article

Retrieve a single article by ID.

**Request:**
```
GET /articles/{id}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "published_date": "2024-01-15",
    "author": "John Doe",
    "content": "<p>Full article content...</p>",
    "source_url": "https://.com/blogs/article-title",
    "version_type": "original",
    "status": "published",
    "metadata": null,
    "references": [],
    "original_article_id": null,
    "original_article": null,
    "updated_versions": [],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Article not found"
}
```

---

### Create Article

Create a new article.

**Request:**
```
POST /articles
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Article Title",
  "slug": "new-article-title",
  "published_date": "2024-01-15",
  "author": "Jane Doe",
  "content": "<p>Article content here...</p>",
  "source_url": "https://example.com/article",
  "original_article_id": null,
  "version_type": "original",
  "status": "draft",
  "metadata": {
    "references": [
      {
        "title": "Reference Article",
        "url": "https://reference.com/article",
        "domain": "reference.com"
      }
    ]
  }
}
```

**Required Fields:**
- `title` (string, max: 255)
- `slug` (string, max: 255, unique)
- `content` (string)

**Optional Fields:**
- `published_date` (date, format: YYYY-MM-DD)
- `author` (string, max: 255)
- `source_url` (URL, max: 500)
- `original_article_id` (integer, must exist)
- `version_type` ('original' or 'updated')
- `status` ('draft' or 'published')
- `metadata` (object)

**Response (201):**
```json
{
  "message": "Article created successfully",
  "data": {
    "id": 2,
    "title": "New Article Title",
    ...
  }
}
```

**Validation Error (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "slug": ["An article with this slug already exists."]
  }
}
```

---

### Update Article

Update an existing article.

**Request:**
```
PUT /articles/{id}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "status": "published"
}
```

All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "message": "Article updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    ...
  }
}
```

---

### Delete Article

Delete an article.

**Request:**
```
DELETE /articles/{id}
```

**Response:**
```json
{
  "message": "Article deleted successfully"
}
```

---

### Get Latest Original Article

Retrieve the most recently created original article.

**Request:**
```
GET /articles/latest
```

**Response:**
```json
{
  "data": {
    "id": 5,
    "title": "Latest Article",
    "version_type": "original",
    ...
  }
}
```

---

### Trigger Scraping

Trigger a background job to scrape articles from  blog.

**Request:**
```
POST /articles/scrape
```

**Response (202):**
```json
{
  "message": "Scraping job has been queued"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request"
}
```

### 404 Not Found
```json
{
  "message": "Article not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "Validation failed",
  "errors": {
    "field": ["Error message"]
  }
}
```

### 500 Internal Server Error
```json
{
  "message": "An unexpected error occurred"
}
```

---

## Example Usage

### cURL

```bash
# List articles
curl -X GET "http://localhost:8000/api/articles?version_type=original"

# Get single article
curl -X GET "http://localhost:8000/api/articles/1"

# Create article
curl -X POST "http://localhost:8000/api/articles" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","content":"<p>Test</p>"}'

# Update article
curl -X PUT "http://localhost:8000/api/articles/1" \
  -H "Content-Type: application/json" \
  -d '{"status":"published"}'

# Delete article
curl -X DELETE "http://localhost:8000/api/articles/1"

# Trigger scraping
curl -X POST "http://localhost:8000/api/articles/scrape"
```

### JavaScript (Fetch)

```javascript
// List articles
const response = await fetch('http://localhost:8000/api/articles');
const data = await response.json();

// Create article
const response = await fetch('http://localhost:8000/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Article',
    slug: 'new-article',
    content: '<p>Content here</p>'
  })
});
```
