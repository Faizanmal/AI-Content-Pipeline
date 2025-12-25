/**
 * Enhance Article Script
 * Standalone script to enhance a specific article by ID
 * 
 * Usage: node src/enhance-article.js [article_id]
 */

import config, { validateConfig } from './config/index.js';
import logger from './utils/logger.js';
import enhancementPipeline from './services/enhancementPipeline.js';

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        return { mode: 'latest' };
    }

    const articleId = parseInt(args[0], 10);
    if (isNaN(articleId)) {
        logger.error('Invalid article ID provided');
        process.exit(1);
    }

    return { mode: 'specific', articleId };
}

/**
 * Main function
 */
async function main() {
    const { mode, articleId } = parseArgs();

    logger.info(' Article Enhancement Script');
    logger.info(`Mode: ${mode === 'latest' ? 'Enhance Latest Article' : `Enhance Article #${articleId}`}`);

    try {
        // Validate configuration
        validateConfig();

        let result;
        
        if (mode === 'latest') {
            result = await enhancementPipeline.run();
        } else {
            result = await enhancementPipeline.enhanceById(articleId);
        }

        if (result.success) {
            console.log('\n' + '='.repeat(60));
            console.log('ENHANCEMENT SUCCESSFUL');
            console.log('='.repeat(60));
            console.log(`Original Article: ${result.originalArticle.title}`);
            console.log(`Original ID: ${result.originalArticle.id}`);
            console.log(`Enhanced Article ID: ${result.enhancedArticle.id}`);
            console.log(`References Used: ${result.referencesUsed}`);
            console.log('='.repeat(60) + '\n');
        } else {
            console.log(`\nEnhancement finished: ${result.message}\n`);
        }

        process.exit(0);
    } catch (error) {
        logger.error('Enhancement failed:', error);
        process.exit(1);
    }
}

main();
