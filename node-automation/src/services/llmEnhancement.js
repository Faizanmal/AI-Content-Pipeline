/**
 * LLM Enhancement Service
 * Uses OpenAI to enhance article content
 */

import OpenAI from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import { marked } from 'marked';

/**
 * Initialize OpenAI client
 */
const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

/**
 * Initialize Groq client (OpenAI compatible)
 */
const groq = new OpenAI({
    apiKey: config.groq.apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * LLM Enhancement Service
 */
const llmEnhancementService = {
    /**
     * Enhance an article using LLM
     * @param {Object} originalArticle - Original article to enhance
     * @param {Object[]} referenceArticles - Top-ranking articles for reference
     * @returns {Promise<Object>} - Enhanced article content
     */
    async enhanceArticle(originalArticle, referenceArticles) {
        logger.info(`Enhancing article: ${originalArticle.title}`);

        return withRetry(
            async () => {
                const prompt = this.buildEnhancementPrompt(originalArticle, referenceArticles);
                
                let response;
                let usedProvider = 'groq';
                
                try {
                    if (config.groq.apiKey) {
                        response = await groq.chat.completions.create({
                            model: config.groq.model,
                            messages: [
                                {
                                    role: 'system',
                                    content: this.getSystemPrompt(),
                                },
                                {
                                    role: 'user',
                                    content: prompt,
                                },
                            ],
                            temperature: 0.7,
                            max_tokens: 4000,
                        });
                    } else {
                        throw new Error('Groq API key not available');
                    }
                } catch (groqError) {
                    logger.warn(`Groq enhancement failed: ${groqError.message}. Falling back to OpenAI.`);
                    usedProvider = 'openai';
                    
                    if (!config.openai.apiKey) {
                        throw new Error('OpenAI API key not available');
                    }
                    
                    response = await openai.chat.completions.create({
                        model: config.openai.model,
                        messages: [
                            {
                                role: 'system',
                                content: this.getSystemPrompt(),
                            },
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 4000,
                    });
                }

                const enhancedContent = response.choices[0]?.message?.content;
                
                if (!enhancedContent) {
                    throw new Error('No content returned from LLM');
                }

                logger.info(`Successfully enhanced article: ${originalArticle.title}`);
                
                return {
                    content: marked(enhancedContent),
                    title: originalArticle.title,
                    originalContent: originalArticle.content,
                };
            },
            { operationName: 'enhanceArticle', maxRetries: 2 }
        );
    },

    /**
     * Get the system prompt for content enhancement
     * @returns {string} - System prompt
     */
    getSystemPrompt() {
        return `You are an expert content writer and SEO specialist. Your task is to enhance and improve articles while maintaining their original topic, intent, and core message.

Your enhancements should:
1. **Improve SEO**: Optimize headings, use relevant keywords naturally, improve meta description quality
2. **Enhance Formatting**: Use proper Markdown structure with #, ##, ### headings, bullet points, numbered lists where appropriate
3. **Expand Depth**: Add more valuable information, examples, and explanations where needed
4. **Match Top-Ranking Quality**: Match the depth, structure, and quality of top-ranking content in the niche
5. **Maintain Tone**: Keep the original brand voice and writing style consistent
6. **Add Value**: Include actionable insights, tips, or recommendations

Output Guidelines:
- Return the enhanced article in clean Markdown format
- Use Markdown syntax: # for main headings, ## for subheadings, **bold**, *italic*, - for bullets, 1. for numbered lists
- Keep paragraphs concise and readable
- Use subheadings to break up content
- Include a brief introduction and conclusion

IMPORTANT: Do not add any references section - that will be handled separately.`;
    },

    /**
     * Build the enhancement prompt
     * @param {Object} originalArticle - Original article
     * @param {Object[]} referenceArticles - Reference articles
     * @returns {string} - Enhancement prompt
     */
    buildEnhancementPrompt(originalArticle, referenceArticles) {
        let prompt = `Please enhance the following article:\n\n`;
        prompt += `**Original Article Title:** ${originalArticle.title}\n\n`;
        prompt += `**Original Article Content:**\n${this.extractTextFromHtml(originalArticle.content)}\n\n`;
        
        if (referenceArticles && referenceArticles.length > 0) {
            prompt += `**Reference Articles for Quality and Structure Guidance:**\n\n`;
            
            referenceArticles.forEach((article, index) => {
                prompt += `--- Reference Article ${index + 1} ---\n`;
                prompt += `Title: ${article.title}\n`;
                prompt += `Source: ${article.domain}\n`;
                prompt += `Content Summary:\n${this.truncateText(article.textContent || article.content, 2000)}\n\n`;
            });
            
            prompt += `\nPlease analyze the structure, depth, and quality of these top-ranking reference articles and enhance the original article to match or exceed their quality while maintaining the original topic and intent.`;
        }

        return prompt;
    },

    /**
     * Extract plain text from HTML
     * @param {string} html - HTML content
     * @returns {string} - Plain text
     */
    extractTextFromHtml(html) {
        if (!html) return '';
        
        // Simple HTML to text conversion
        return html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Truncate text to a maximum length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Generate references section HTML
     * @param {Object[]} referenceArticles - Reference articles
     * @returns {string} - References HTML
     */
    generateReferencesSection(referenceArticles) {
        if (!referenceArticles || referenceArticles.length === 0) {
            return '';
        }

        let html = `\n\n<section class="references">\n`;
        html += `<h2>References</h2>\n`;
        html += `<p>This article was enhanced with insights from the following sources:</p>\n`;
        html += `<ul>\n`;
        
        referenceArticles.forEach(article => {
            html += `  <li>\n`;
            html += `    <a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>\n`;
            html += `    <span class="source-domain">(${article.domain})</span>\n`;
            html += `  </li>\n`;
        });
        
        html += `</ul>\n`;
        html += `</section>`;

        return html;
    },
};

export default llmEnhancementService;
