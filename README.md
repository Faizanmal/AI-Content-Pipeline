#  AI Content Pipeline

A complete multi-stack project for AI-assisted content enhancement, featuring web scraping, content management, and LLM-powered article improvement.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Content Pipeline                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │   React.js       │     │    Laravel       │     │    Node.js       │     │
│  │   Frontend       │────▶│    Backend       │◀────│    Automation    │     │
│  │   (Port 3000)    │     │   (Port 8000)    │     │    Service       │     │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘     │
│          │                        │                        │                 │
│          │                        │                        │                 │
│          ▼                        ▼                        ▼                 │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │   Article List   │     │    MySQL/        │     │   Google Search  │     │
│  │   Article Detail │     │    PostgreSQL    │     │   API / SerpAPI  │     │
│  │   Responsive UI  │     │    Database      │     │                  │     │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘     │
│                                                            │                 │
│                                                            ▼                 │
│                                                    ┌──────────────────┐     │
│                                                    │   OpenAI API     │     │
│                                                    │   (GPT-4)        │     │
│                                                    └──────────────────┘     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   └── ArticleController.php
│   │   │   ├── Requests/
│   │   │   │   ├── StoreArticleRequest.php
│   │   │   │   └── UpdateArticleRequest.php
│   │   │   └── Resources/
│   │   │       ├── ArticleResource.php
│   │   │       └── ArticleCollection.php
│   │   ├── Jobs/
│   │   │   └── ScrapeArticlesJob.php
│   │   ├── Models/
│   │   │   └── Article.php
│   │   └── Services/
│   │       ├── ArticleService.php
│   │       └── ScraperService.php
│   ├── database/
│   │   └── migrations/
│   │       └── 2025_12_23_000001_create_articles_table.php
│   ├── routes/
│   │   └── api.php
│   └── .env.example
│
├── node-automation/         # Node.js Automation Service
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js
│   │   ├── services/
│   │   │   ├── laravelApi.js
│   │   │   ├── googleSearch.js
│   │   │   ├── contentScraper.js
│   │   │   ├── llmEnhancement.js
│   │   │   └── enhancementPipeline.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── retry.js
│   │   ├── index.js
│   │   └── enhance-article.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                # React.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   ├── ArticleCard/
│   │   │   ├── Loading/
│   │   │   └── ErrorMessage/
│   │   ├── pages/
│   │   │   ├── ArticleList/
│   │   │   └── ArticleDetail/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- npm or yarn
- MySQL or PostgreSQL

### 1. Laravel Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
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

# Start server
php artisan serve
```

### 2. Node.js Automation Setup

```bash
cd node-automation

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure API keys in .env
# SERP_API_KEY=your_key
# OPENAI_API_KEY=your_key

# Run enhancement
npm start
```

### 3. React Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

## 📊 Database Schema

### Articles Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| title | VARCHAR(255) | Article title |
| slug | VARCHAR(255) | URL-friendly slug (unique) |
| published_date | DATE | Publication date |
| author | VARCHAR(255) | Author name |
| content | LONGTEXT | Full HTML content |
| source_url | VARCHAR(500) | Original source URL |
| original_article_id | BIGINT | FK to original article (nullable) |
| version_type | ENUM | 'original' or 'updated' |
| status | ENUM | 'draft' or 'published' |
| metadata | JSON | Additional data (references, etc.) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

## 🔌 API Endpoints

### Articles API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List all articles (paginated) |
| POST | `/api/articles` | Create new article |
| GET | `/api/articles/{id}` | Get single article |
| PUT | `/api/articles/{id}` | Update article |
| DELETE | `/api/articles/{id}` | Delete article |
| GET | `/api/articles/latest` | Get latest original article |
| POST | `/api/articles/scrape` | Trigger blog scraping |

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| version_type | Filter by 'original' or 'updated' |
| status | Filter by 'draft' or 'published' |
| search | Search in title |
| per_page | Items per page (default: 15) |
| page | Page number |

## ⚙️ Enhancement Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Content Enhancement Pipeline                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐│
│  │  Step 1     │     │  Step 2     │     │  Step 3     │     │  Step 4     ││
│  │  Fetch      │────▶│  Search     │────▶│  Scrape     │────▶│  Enhance    ││
│  │  Article    │     │  Google     │     │  Content    │     │  with LLM   ││
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘│
│        │                   │                   │                   │         │
│        ▼                   ▼                   ▼                   ▼         │
│  Get latest          Find top 2          Extract main        GPT-4 improves:│
│  original            ranking blogs       content from        - SEO          │
│  article from        (exclude            scraped pages       - Formatting   │
│  Laravel API         )                            - Depth        │
│                                                                               │
│                            ┌─────────────┐                                   │
│                            │  Step 5     │                                   │
│                            │  Publish    │◀──────────────────────────────────│
│                            │  Enhanced   │                                   │
│                            └─────────────┘                                   │
│                                  │                                           │
│                                  ▼                                           │
│                           Create new article                                 │
│                           linked to original                                 │
│                           with references                                    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Laravel (.env)

```env
APP_NAME=" Content Pipeline"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_DATABASE=_articles

FRONTEND_URL=http://localhost:3000
```

### Node.js (.env)

```env
LARAVEL_API_URL=http://localhost:8000/api

# Search API (choose one)
SERP_API_KEY=your_serpapi_key
# OR
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4
```

### React (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🏃 Running the Complete System

1. **Start Laravel Backend** (Terminal 1)
   ```bash
   cd backend && php artisan serve
   ```

2. **Start React Frontend** (Terminal 2)
   ```bash
   cd frontend && npm start
   ```

3. **Run Article Scraping** (Terminal 3)
   ```bash
   # Via API
   curl -X POST http://localhost:8000/api/articles/scrape
   
   # Or via Laravel queue
   cd backend && php artisan queue:work
   ```

4. **Run Content Enhancement** (Terminal 3)
   ```bash
   cd node-automation && npm start
   ```

## 📝 Development Commands

### Laravel

```bash
# Run tests
php artisan test

# Clear caches
php artisan optimize:clear

# Run queue worker
php artisan queue:work

# Create new migration
php artisan make:migration create_example_table
```

### Node.js

```bash
# Development mode (with watch)
npm run dev

# Run enhancement for specific article
node src/enhance-article.js 1
```

### React

```bash
# Development
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🔒 Security Considerations

1. **API Keys**: Never commit `.env` files with real API keys
2. **CORS**: Configure allowed origins in Laravel `config/cors.php`
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: All inputs are validated via Form Requests
5. **XSS Prevention**: Content is sanitized before storage

## 📦 Dependencies

### Laravel
- symfony/dom-crawler (web scraping)
- symfony/css-selector (CSS selectors)

### Node.js
- axios (HTTP client)
- cheerio (HTML parsing)
- openai (OpenAI API)
- winston (logging)
- dotenv (environment variables)

### React
- react-router-dom (routing)
- axios (API calls)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## � Deployment

### Azure Deployment

This project is designed to be deployed on Azure using the following services:

- **Backend (Laravel)**: Azure App Service
- **Frontend (Next.js)**: Azure Static Web App
- **Database**: Azure Database for MySQL
- **Automation Service**: Azure Container Apps

#### Prerequisites
- Azure CLI installed (`az --version`)
- Azure account with active subscription

#### Deployment Steps
1. Clone the repository
2. Login to Azure: `az login`
3. Create a resource group: `az group create --name -rg --location eastus`
4. Deploy database: `az mysql flexible-server create --resource-group -rg --name -db --location eastus --admin-user adminuser --admin-password <secure-password> --sku-name Standard_B1ms --tier Burstable --storage-size 20 --version 8`
5. Deploy backend App Service: `az appservice plan create --name -plan --resource-group -rg --sku B1 --location eastus`
   `az webapp create --name -backend --resource-group -rg --plan -plan --runtime "PHP|8.2"`
6. Deploy frontend Static Web App: `az staticwebapp create --name -frontend --resource-group -rg --location eastus --source ./frontend --branch main --app-location "/" --api-location "" --output-location "out" --login-with-github false`
7. For automation, create a Container App: `az containerapp create --name -automation --resource-group -rg --environment -env --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest --target-port 80 --ingress external`
8. Configure environment variables for each service via Azure Portal (App Settings for App Service, Environment Variables for Static Web App and Container App).

#### Live Link
After deployment, the frontend will be available at the Azure Static Web App URL, e.g., `https://-frontend.azurestaticapps.net`

For automated IaC deployment using Azure Developer CLI (azd):
- Install azd: `winget install Microsoft.AzureDeveloperCLI`
- Run `azd up` from the project root (requires azure.yaml and infra/ folder)

See `.azure/plan.copilotmd` for detailed deployment plan.

## �📄 License

MIT License - feel free to use this project for your own purposes.
