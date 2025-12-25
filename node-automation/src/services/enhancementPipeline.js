/**
 * Article Enhancement Pipeline
 * Orchestrates the complete enhancement workflow
 */

import laravelApiService from './laravelApi.js';
import googleSearchService from './googleSearch.js';
import contentScraperService from './contentScraper.js';
import llmEnhancementService from './llmEnhancement.js';
import logger from '../utils/logger.js';
import { graceful } from '../utils/retry.js';

/**
 * Article Enhancement Pipeline
 */
const enhancementPipeline = {
    /**
     * Run the complete enhancement pipeline for the latest article
     * @returns {Promise<Object>} - Result of the enhancement
     */
    async run() {
        logger.info('='.repeat(60));
        logger.info('Starting Article Enhancement Pipeline');
        logger.info('='.repeat(60));

        try {
            // Step 1: Fetch the latest original article
            const article = await this.fetchLatestArticle();
            if (!article) {
                logger.warn('No original articles found to enhance');
                return { success: false, message: 'No articles found' };
            }

            // Step 2: Search for top-ranking related articles
            const searchResults = await this.searchRelatedArticles(article.title);
            if (searchResults.length === 0) {
                logger.warn('No related articles found, proceeding with enhancement anyway');
            }

            // Step 3: Scrape content from related articles
            const scrapedContent = await this.scrapeRelatedArticles(searchResults);

            // Step 4: Enhance the article with LLM
            const enhancedContent = await this.enhanceWithLLM(article, scrapedContent);

            // Step 5: Create the enhanced version in Laravel
            const newArticle = await this.publishEnhancedArticle(article, enhancedContent, scrapedContent);

            logger.info('='.repeat(60));
            logger.info('Article Enhancement Pipeline Completed Successfully!');
            logger.info(`Original Article ID: ${article.id}`);
            logger.info(`Enhanced Article ID: ${newArticle.id}`);
            logger.info('='.repeat(60));

            return {
                success: true,
                originalArticle: article,
                enhancedArticle: newArticle,
                referencesUsed: scrapedContent.length,
            };
        } catch (error) {
            logger.error('Enhancement pipeline failed:', error);
            throw error;
        }
    },

    /**
     * Step 1: Fetch the latest original article from Laravel API
     * @returns {Promise<Object|null>} - Article or null
     */
    async fetchLatestArticle() {
        logger.info('Step 1: Fetching latest original article...');
        
        const [error, article] = await graceful(
            laravelApiService.getLatestOriginalArticle()
        );

        if (error) {
            logger.error('Failed to fetch latest article:', error.message);
            throw error;
        }

        if (!article) {
            return null;
        }

        logger.info(`Found article: "${article.title}" (ID: ${article.id})`);
        return article;
    },

    /**
     * Step 2: Search for top-ranking related articles
     * @param {string} title - Article title to search for
     * @returns {Promise<Object[]>} - Search results
     */
    async searchRelatedArticles(title) {
        logger.info('Step 2: Searching for top-ranking related articles...');
        
        const [error, results] = await graceful(
            googleSearchService.search(title, 2)
        );

        if (error) {
            logger.warn('Search failed, continuing without references:', error.message);
            return [];
        }

        logger.info(`Found ${results.length} related articles`);
        results.forEach((result, i) => {
            logger.info(`  ${i + 1}. ${result.title} (${result.domain})`);
        });

        return results;
    },

    /**
     * Step 3: Scrape content from related articles
     * @param {Object[]} searchResults - Search results
     * @returns {Promise<Object[]>} - Scraped content
     */
    async scrapeRelatedArticles(searchResults) {
        if (searchResults.length === 0) {
            logger.info('Step 3: Skipping scraping (no search results)');
            return [];
        }

        logger.info('Step 3: Scraping content from related articles...');
        
        const urls = searchResults.map(r => r.url);
        const scrapedContent = await contentScraperService.scrapeMultiple(urls);

        logger.info(`Successfully scraped ${scrapedContent.length} articles`);
        return scrapedContent;
    },

    /**
     * Step 4: Enhance article with LLM
     * @param {Object} originalArticle - Original article
     * @param {Object[]} referenceArticles - Reference articles
     * @returns {Promise<Object>} - Enhanced content
     */
    async enhanceWithLLM(originalArticle, referenceArticles) {
        logger.info('Step 4: Enhancing article with LLM...');
        
        const enhanced = await llmEnhancementService.enhanceArticle(
            originalArticle,
            referenceArticles
        );

        // Add references section
        const referencesHtml = llmEnhancementService.generateReferencesSection(referenceArticles);
        enhanced.content += referencesHtml;

        logger.info('Article enhancement complete');
        return enhanced;
    },

    /**
     * Step 5: Publish the enhanced article
     * @param {Object} originalArticle - Original article
     * @param {Object} enhancedContent - Enhanced content
     * @param {Object[]} references - Reference articles
     * @returns {Promise<Object>} - New article
     */
    async publishEnhancedArticle(originalArticle, enhancedContent, references) {
        logger.info('Step 5: Publishing enhanced article to Laravel...');

        // Prepare article data
        const articleData = {
            title: originalArticle.title,
            slug: `${originalArticle.slug}-enhanced-${Date.now()}`,
            published_date: new Date().toISOString().split('T')[0],
            author: originalArticle.author,
            content: enhancedContent.content,
            source_url: originalArticle.source_url,
            original_article_id: originalArticle.id,
            version_type: 'updated',
            status: 'published',
            metadata: {
                references: references.map(ref => ({
                    title: ref.title,
                    url: ref.url,
                    domain: ref.domain,
                })),
                enhanced_at: new Date().toISOString(),
                enhancement_model: 'gpt-4',
            },
        };

        const newArticle = await laravelApiService.createArticle(articleData);
        logger.info(`Created enhanced article with ID: ${newArticle.id}`);

        return newArticle;
    },

    /**
     * Enhance a specific article by ID
     * @param {number} articleId - Article ID to enhance
     * @returns {Promise<Object>} - Result of the enhancement
     */
    async enhanceById(articleId) {
        logger.info(`Enhancing article with ID: ${articleId}`);

        try {
            // Fetch the specific article
            const article = await laravelApiService.getArticle(articleId);
            if (!article) {
                throw new Error(`Article with ID ${articleId} not found`);
            }

            // Follow the same pipeline
            const searchResults = await this.searchRelatedArticles(article.title);
            const scrapedContent = await this.scrapeRelatedArticles(searchResults);
            const enhancedContent = await this.enhanceWithLLM(article, scrapedContent);
            const newArticle = await this.publishEnhancedArticle(article, enhancedContent, scrapedContent);

            return {
                success: true,
                originalArticle: article,
                enhancedArticle: newArticle,
                referencesUsed: scrapedContent.length,
            };
        } catch (error) {
            logger.error(`Failed to enhance article ${articleId}:`, error);
            throw error;
        }
    },
};

export default enhancementPipeline;
