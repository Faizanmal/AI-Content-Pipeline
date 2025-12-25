# Node.js Content Enhancement Automation

This is the Node.js automation service for the  AI Content Enhancement Pipeline.

## Features

- Automatic article fetching from Laravel API
- Google Search integration (SerpAPI or Google Custom Search)
- Web content scraping with Cheerio
- LLM-powered content enhancement using OpenAI
- Modular architecture with retry logic
- Comprehensive logging

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your API keys in .env
```

## Configuration

Edit `.env` with your API keys:

```env
# Laravel API
LARAVEL_API_URL=http://localhost:8000/api

# Search API (choose one)
SERP_API_KEY=your_serpapi_key_here
# OR
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
```

## Usage

### Enhance Latest Article

```bash
npm start
```

### Enhance Specific Article

```bash
node src/enhance-article.js <article_id>
```

### Development Mode (with watch)

```bash
npm run dev
```

## Architecture

```
src/
├── config/
│   └── index.js              # Configuration management
├── services/
│   ├── laravelApi.js         # Laravel API client
│   ├── googleSearch.js       # Google/SerpAPI search
│   ├── contentScraper.js     # Web content scraping
│   ├── llmEnhancement.js     # OpenAI enhancement
│   └── enhancementPipeline.js # Main pipeline orchestrator
├── utils/
│   ├── logger.js             # Winston logger
│   └── retry.js              # Retry utilities
├── index.js                  # Main entry point
└── enhance-article.js        # CLI for specific articles
```

## Enhancement Pipeline

1. **Fetch Article**: Get the latest original article from Laravel
2. **Search Google**: Find top 2 ranking articles on the same topic
3. **Scrape Content**: Extract main content from found articles
4. **Enhance with LLM**: Use GPT-4 to improve the article
5. **Publish**: Create enhanced version via Laravel API

## Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output with colors

## API Keys Required

1. **OpenAI API Key** - Required for content enhancement
2. **Search API** - One of:
   - SerpAPI key
   - Google Custom Search API key + Search Engine ID
