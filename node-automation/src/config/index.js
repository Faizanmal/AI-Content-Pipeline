/**
 * Configuration Module
 * Centralized configuration management with environment variable validation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Application configuration
 */
const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Laravel API
    laravelApiUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000/api',

    // Search API Configuration
    search: {
        // Tavily
        tavilyApiKey: process.env.TAVILY_API_KEY,
        
        // SerpAPI
        serpApiKey: process.env.SERP_API_KEY,
        
        // Google Custom Search API
        googleApiKey: process.env.GOOGLE_API_KEY,
        googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,

        // Determine which API to use (priority: Tavily > SerpAPI > Google)
        get provider() {
            if (this.tavilyApiKey) return 'tavily';
            if (this.serpApiKey) return 'serpapi';
            if (this.googleApiKey && this.googleSearchEngineId) return 'google';
            return null;
        }
    },

    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
    },

    // Groq Configuration
    groq: {
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    },

    // Application Settings
    maxRetries: parseInt(process.env.MAX_RETRIES, 10) || 3,
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS, 10) || 2000,
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Scraping Settings
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 30000,
    maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH, 10) || 200000,
};

/**
 * Validate required configuration
 */
export function validateConfig() {
    const errors = [];

    if (!config.openai.apiKey && !config.groq.apiKey) {
        errors.push('Either OPENAI_API_KEY or GROQ_API_KEY is required');
    }

    if (!config.search.provider) {
        errors.push('Either SERP_API_KEY or (GOOGLE_API_KEY + GOOGLE_SEARCH_ENGINE_ID) is required');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
}

export default config;
