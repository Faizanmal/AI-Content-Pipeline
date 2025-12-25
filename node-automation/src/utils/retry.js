/**
 * Retry Utility
 * Implements retry logic with exponential backoff
 */

import logger from './logger.js';
import config from '../config/index.js';

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.delayMs - Initial delay between retries
 * @param {boolean} options.exponentialBackoff - Use exponential backoff
 * @param {string} options.operationName - Name of the operation for logging
 * @returns {Promise<*>} - Result of the function
 */
export async function withRetry(fn, options = {}) {
    const {
        maxRetries = config.maxRetries,
        delayMs = config.retryDelayMs,
        exponentialBackoff = true,
        operationName = 'operation'
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.debug(`Attempt ${attempt}/${maxRetries} for ${operationName}`);
            return await fn();
        } catch (error) {
            lastError = error;
            logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${operationName}: ${error.message}`);

            if (attempt < maxRetries) {
                const delay = exponentialBackoff 
                    ? delayMs * Math.pow(2, attempt - 1)
                    : delayMs;
                
                logger.info(`Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    logger.error(`All ${maxRetries} attempts failed for ${operationName}`);
    throw lastError;
}

/**
 * Graceful error handler for async operations
 * @param {Promise} promise - Promise to handle
 * @returns {Promise<[Error|null, *]>} - Tuple of [error, result]
 */
export async function graceful(promise) {
    try {
        const result = await promise;
        return [null, result];
    } catch (error) {
        return [error, null];
    }
}
