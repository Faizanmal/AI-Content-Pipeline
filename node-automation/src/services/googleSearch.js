/**
 * Google Search Service
 * Handles searching for relevant articles using various search APIs
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

/**
 * Search result interface
 * @typedef {Object} SearchResult
 * @property {string} title - Article title
 * @property {string} url - Article URL
 * @property {string} snippet - Article snippet
 * @property {string} domain - Source domain
 */

/**
 * Google Search Service
 */
const googleSearchService = {
    /**
     * Search for articles related to a query
     * @param {string} query - Search query
     * @param {number} numResults - Number of results to return
     * @returns {Promise<SearchResult[]>} - Search results
     */
    async search(query, numResults = 2) {
        const providers = ['tavily', 'serpapi', 'google'];
        
        for (const provider of providers) {
            if (this.isProviderAvailable(provider)) {
                logger.info(`Searching for: "${query}" using ${provider}`);
                
                try {
                    let results;
                    
                    if (provider === 'tavily') {
                        results = await this.searchWithTavily(query, numResults);
                    } else if (provider === 'serpapi') {
                        results = await this.searchWithSerpApi(query, numResults);
                    } else {
                        results = await this.searchWithGoogleApi(query, numResults);
                    }

                    // Filter out  results and ensure they are blog/article content
                    const filteredResults = results
                        .filter(result => !result.url.includes('.com'))
                        .filter(result => this.isLikelyArticle(result))
                        .slice(0, numResults);

                    logger.info(`Found ${filteredResults.length} relevant articles using ${provider}`);
                    return filteredResults;
                } catch (error) {
                    logger.warn(`${provider} search failed: ${error.message}. Trying next provider...`);
                }
            }
        }

        throw new Error('All search providers failed');
    },

    /**
     * Check if a provider is available
     * @param {string} provider - Provider name
     * @returns {boolean} - Whether the provider is available
     */
    isProviderAvailable(provider) {
        if (provider === 'tavily') return !!config.search.tavilyApiKey;
        if (provider === 'serpapi') return !!config.search.serpApiKey;
        if (provider === 'google') return !!(config.search.googleApiKey && config.search.googleSearchEngineId);
        return false;
    },

    /**
     * Search using SerpAPI
     * @param {string} query - Search query
     * @param {number} numResults - Number of results
     * @returns {Promise<SearchResult[]>} - Search results
     */
    async searchWithSerpApi(query, numResults) {
        return withRetry(
            async () => {
                const response = await axios.get('https://serpapi.com/search', {
                    params: {
                        api_key: config.search.serpApiKey,
                        q: query,
                        num: numResults + 5, // Request more to account for filtering
                        engine: 'google',
                    },
                    timeout: config.requestTimeoutMs,
                });

                const organicResults = response.data.organic_results || [];
                
                return organicResults.map(result => ({
                    title: result.title,
                    url: result.link,
                    snippet: result.snippet || '',
                    domain: this.extractDomain(result.link),
                }));
            },
            { operationName: 'SerpAPI search' }
        );
    },

    /**
     * Search using Tavily API
     * @param {string} query - Search query
     * @param {number} numResults - Number of results
     * @returns {Promise<SearchResult[]>} - Search results
     */
    async searchWithTavily(query, numResults) {
        return withRetry(
            async () => {
                const response = await axios.post('https://api.tavily.com/search', {
                    api_key: config.search.tavilyApiKey,
                    query: query,
                    search_depth: 'advanced',
                    include_images: false,
                    include_answer: false,
                    include_raw_content: false,
                    max_results: numResults + 5, // Request more to account for filtering
                    include_domains: [],
                    exclude_domains: [],
                }, {
                    timeout: config.requestTimeoutMs,
                });

                const results = response.data.results || [];
                
                return results.map(result => ({
                    title: result.title,
                    url: result.url,
                    snippet: result.content || '',
                    domain: this.extractDomain(result.url),
                }));
            },
            { operationName: 'Tavily search' }
        );
    },

    /**
     * Search using Google Custom Search API
     * @param {string} query - Search query
     * @param {number} numResults - Number of results
     * @returns {Promise<SearchResult[]>} - Search results
     */
    async searchWithGoogleApi(query, numResults) {
        return withRetry(
            async () => {
                const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                    params: {
                        key: config.search.googleApiKey,
                        cx: config.search.googleSearchEngineId,
                        q: query,
                        num: Math.min(numResults + 5, 10), // Max 10 for Google API
                    },
                    timeout: config.requestTimeoutMs,
                });

                const items = response.data.items || [];
                
                return items.map(item => ({
                    title: item.title,
                    url: item.link,
                    snippet: item.snippet || '',
                    domain: this.extractDomain(item.link),
                }));
            },
            { operationName: 'Google Custom Search' }
        );
    },

    /**
     * Check if a search result is likely an article/blog post
     * @param {SearchResult} result - Search result
     * @returns {boolean} - Whether it's likely an article
     */
    isLikelyArticle(result) {
        const url = result.url.toLowerCase();
        const title = result.title.toLowerCase();
        
        // Exclude obvious non-article content
        const excludePatterns = [
            '/product/', '/shop/', '/cart/', '/checkout/',
            '/login/', '/signup/', '/register/',
            '/category/', '/tag/', '/author/',
            '/about/', '/contact/', '/privacy/', '/terms/',
            '.pdf', '.doc', '.xls',
        ];
        
        for (const pattern of excludePatterns) {
            if (url.includes(pattern)) {
                return false;
            }
        }

        // Look for article-like patterns
        const articlePatterns = [
            '/blog/', '/article/', '/post/', '/news/',
            '/guide/', '/tutorial/', '/how-to/',
            '/insights/', '/resources/', '/learn/',
        ];
        
        for (const pattern of articlePatterns) {
            if (url.includes(pattern)) {
                return true;
            }
        }

        // Default to true if no patterns matched
        return true;
    },

    /**
     * Extract domain from URL
     * @param {string} url - Full URL
     * @returns {string} - Domain name
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return url;
        }
    },
};

export default googleSearchService;
