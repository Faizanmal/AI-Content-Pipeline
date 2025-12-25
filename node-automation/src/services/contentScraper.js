/**
 * Content Scraper Service
 * Extracts main readable content from web pages
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

/**
 * Scraped content interface
 * @typedef {Object} ScrapedContent
 * @property {string} title - Article title
 * @property {string} content - Cleaned HTML content
 * @property {string} textContent - Plain text content
 * @property {string} url - Source URL
 * @property {string} domain - Source domain
 */

/**
 * Content Scraper Service
 */
const contentScraperService = {
    /**
     * Scrape main content from a URL
     * @param {string} url - URL to scrape
     * @returns {Promise<ScrapedContent>} - Scraped content
     */
    async scrape(url) {
        logger.info(`Scraping content from: ${url}`);

        return withRetry(
            async () => {
                const response = await axios.get(url, {
                    timeout: config.requestTimeoutMs,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    },
                    maxContentLength: config.maxContentLength,
                });

                const $ = cheerio.load(response.data);
                
                // Remove unwanted elements
                this.removeUnwantedElements($);
                
                // Extract main content
                const mainContent = this.extractMainContent($);
                const title = this.extractTitle($);
                
                const result = {
                    title,
                    content: mainContent.html,
                    textContent: mainContent.text,
                    url,
                    domain: this.extractDomain(url),
                };

                logger.info(`Successfully scraped: ${title} (${mainContent.text.length} chars)`);
                return result;
            },
            { operationName: `scrape(${url})` }
        );
    },

    /**
     * Scrape multiple URLs
     * @param {string[]} urls - URLs to scrape
     * @returns {Promise<ScrapedContent[]>} - Scraped content array
     */
    async scrapeMultiple(urls) {
        const results = [];
        
        for (const url of urls) {
            try {
                const content = await this.scrape(url);
                results.push(content);
            } catch (error) {
                logger.error(`Failed to scrape ${url}: ${error.message}`);
                // Continue with other URLs
            }
        }
        
        return results;
    },

    /**
     * Remove unwanted elements from the page
     * @param {cheerio.CheerioAPI} $ - Cheerio instance
     */
    removeUnwantedElements($) {
        // Elements to remove
        const selectorsToRemove = [
            'script',
            'style',
            'noscript',
            'iframe',
            'nav',
            'header',
            'footer',
            'aside',
            '.advertisement',
            '.ads',
            '.ad',
            '.ad-container',
            '[class*="ad-"]',
            '[id*="ad-"]',
            '.social-share',
            '.social-buttons',
            '.share-buttons',
            '.comments',
            '.comment-section',
            '#comments',
            '.related-posts',
            '.related-articles',
            '.sidebar',
            '.widget',
            '.newsletter',
            '.subscribe',
            '.popup',
            '.modal',
            '.cookie-notice',
            '.cookie-banner',
            '.navigation',
            '.nav',
            '.menu',
            '.breadcrumb',
            '.author-bio',
            '.author-box',
            'form',
            '.search-form',
            '.pagination',
        ];

        selectorsToRemove.forEach(selector => {
            $(selector).remove();
        });
    },

    /**
     * Extract the main content from the page
     * @param {cheerio.CheerioAPI} $ - Cheerio instance
     * @returns {Object} - HTML and text content
     */
    extractMainContent($) {
        // Priority selectors for main content
        const contentSelectors = [
            'article',
            '[role="main"]',
            'main',
            '.post-content',
            '.article-content',
            '.entry-content',
            '.content',
            '.post-body',
            '.article-body',
            '#content',
            '.blog-post',
            '.single-post',
        ];

        let mainElement = null;

        // Try to find the best content container
        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                mainElement = element.first();
                break;
            }
        }

        // Fallback to body if no content container found
        if (!mainElement) {
            mainElement = $('body');
        }

        // Extract relevant content (headings, paragraphs, lists)
        const contentParts = [];
        
        mainElement.find('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote').each((_, element) => {
            const el = $(element);
            const tagName = element.tagName.toLowerCase();
            const html = $.html(element);
            const text = el.text().trim();
            
            if (text.length > 0) {
                contentParts.push({
                    tagName,
                    html,
                    text,
                });
            }
        });

        // Build cleaned HTML
        const cleanedHtml = contentParts.map(part => part.html).join('\n');
        const cleanedText = contentParts.map(part => part.text).join('\n\n');

        return {
            html: cleanedHtml,
            text: cleanedText,
        };
    },

    /**
     * Extract the title from the page
     * @param {cheerio.CheerioAPI} $ - Cheerio instance
     * @returns {string} - Page title
     */
    extractTitle($) {
        // Try different selectors for title
        const titleSelectors = [
            'h1',
            '.post-title',
            '.article-title',
            '.entry-title',
            '[itemprop="headline"]',
            'title',
        ];

        for (const selector of titleSelectors) {
            const element = $(selector).first();
            if (element.length > 0) {
                const text = element.text().trim();
                if (text.length > 0 && text.length < 200) {
                    return text;
                }
            }
        }

        return 'Untitled';
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

export default contentScraperService;
