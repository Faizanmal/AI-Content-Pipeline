/**
 * Laravel API Service
 * Handles communication with the Laravel backend
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

/**
 * Create axios instance for Laravel API
 */
const apiClient = axios.create({
    baseURL: config.laravelApiUrl,
    timeout: config.requestTimeoutMs,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Request interceptor for logging
 */
apiClient.interceptors.request.use(
    (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for logging
 */
apiClient.interceptors.response.use(
    (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message;
        logger.error(`API Response Error: ${message}`);
        return Promise.reject(error);
    }
);

/**
 * Laravel API Service
 */
const laravelApiService = {
    /**
     * Get all articles with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Articles data
     */
    async getArticles(params = {}) {
        return withRetry(
            async () => {
                const response = await apiClient.get('/articles', { params });
                return response.data;
            },
            { operationName: 'getArticles' }
        );
    },

    /**
     * Get a single article by ID
     * @param {number} id - Article ID
     * @returns {Promise<Object>} - Article data
     */
    async getArticle(id) {
        return withRetry(
            async () => {
                const response = await apiClient.get(`/articles/${id}`);
                return response.data.data;
            },
            { operationName: `getArticle(${id})` }
        );
    },

    /**
     * Get the latest original article
     * @returns {Promise<Object>} - Latest original article
     */
    async getLatestOriginalArticle() {
        return withRetry(
            async () => {
                const response = await apiClient.get('/articles/latest');
                return response.data.data;
            },
            { operationName: 'getLatestOriginalArticle' }
        );
    },

    /**
     * Create a new article
     * @param {Object} articleData - Article data
     * @returns {Promise<Object>} - Created article
     */
    async createArticle(articleData) {
        return withRetry(
            async () => {
                const response = await apiClient.post('/articles', articleData);
                return response.data.data;
            },
            { operationName: 'createArticle' }
        );
    },

    /**
     * Update an existing article
     * @param {number} id - Article ID
     * @param {Object} articleData - Updated data
     * @returns {Promise<Object>} - Updated article
     */
    async updateArticle(id, articleData) {
        return withRetry(
            async () => {
                const response = await apiClient.put(`/articles/${id}`, articleData);
                return response.data.data;
            },
            { operationName: `updateArticle(${id})` }
        );
    },

    /**
     * Delete an article
     * @param {number} id - Article ID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteArticle(id) {
        return withRetry(
            async () => {
                await apiClient.delete(`/articles/${id}`);
                return true;
            },
            { operationName: `deleteArticle(${id})` }
        );
    },

    /**
     * Trigger article scraping
     * @returns {Promise<Object>} - Response message
     */
    async triggerScrape() {
        return withRetry(
            async () => {
                const response = await apiClient.post('/articles/scrape');
                return response.data;
            },
            { operationName: 'triggerScrape' }
        );
    },
};

export default laravelApiService;
