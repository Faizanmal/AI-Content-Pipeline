/**
 *  Content Enhancement Automation
 * Main entry point
 */

import config, { validateConfig } from './config/index.js';
import logger from './utils/logger.js';
import enhancementPipeline from './services/enhancementPipeline.js';

/**
 * Main function
 */
async function main() {
    logger.info(' Content Enhancement Service Starting...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Laravel API: ${config.laravelApiUrl}`);

    try {
        // Validate configuration
        validateConfig();
        logger.info('Configuration validated successfully');

        // Run the enhancement pipeline
        const result = await enhancementPipeline.run();

        if (result.success) {
            logger.info('Enhancement completed successfully!');
            logger.info(`Original Article: ${result.originalArticle.title}`);
            logger.info(`Enhanced Article ID: ${result.enhancedArticle.id}`);
            logger.info(`References Used: ${result.referencesUsed}`);
        } else {
            logger.warn(`Enhancement finished with message: ${result.message}`);
        }

        process.exit(0);
    } catch (error) {
        logger.error('Enhancement failed:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run main function
main();
