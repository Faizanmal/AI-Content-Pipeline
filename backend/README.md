#  Laravel Backend

This is the Laravel backend for the  AI Content Enhancement Pipeline.

## Features

- RESTful API for article management
- Web scraping service for  blog
- Queue-based background jobs
- Database migrations for MySQL/PostgreSQL

## Installation

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=_articles
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Start the development server
php artisan serve
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List all articles |
| POST | `/api/articles` | Create new article |
| GET | `/api/articles/{id}` | Get single article |
| PUT | `/api/articles/{id}` | Update article |
| DELETE | `/api/articles/{id}` | Delete article |
| GET | `/api/articles/latest` | Get latest original article |
| POST | `/api/articles/scrape` | Trigger scraping job |

## Query Parameters

- `version_type`: Filter by 'original' or 'updated'
- `status`: Filter by 'draft' or 'published'
- `search`: Search in article title
- `per_page`: Items per page (default: 15)
- `page`: Page number

## Running Queue Worker

For the scraping job to work:

```bash
php artisan queue:work
```

## Architecture

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   └── ArticleController.php    # API endpoints
│   ├── Requests/
│   │   ├── StoreArticleRequest.php  # Validation for create
│   │   └── UpdateArticleRequest.php # Validation for update
│   └── Resources/
│       ├── ArticleResource.php      # Single article response
│       └── ArticleCollection.php    # Paginated list response
├── Jobs/
│   └── ScrapeArticlesJob.php        # Background scraping job
├── Models/
│   └── Article.php                  # Eloquent model
└── Services/
    ├── ArticleService.php           # Business logic
    └── ScraperService.php           # Web scraping logic
```

## Testing

```bash
php artisan test
```
