import axios from 'axios';
// Create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});
// Request interceptor
api.interceptors.request.use((config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
});
// Response interceptor
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const message = error.response?.data?.message || error.message;
    console.error('API Response Error:', message);
    return Promise.reject(error);
});
// Article API functions
export const articleApi = {
    /**
     * Get all articles with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<ArticlesResponse>} - Articles data
     */
    getArticles: async (params = {}) => {
        const response = await api.get('/articles', { params });
        return response.data;
    },
    /**
     * Get a single article by ID
     * @param {string | number} id - Article ID
     * @returns {Promise<Article>} - Article data
     */
    getArticle: async (id) => {
        const response = await api.get(`/articles/${id}`);
        return response.data.data;
    },
    /**
     * Trigger scraping
     * @returns {Promise<Object>} - Response
     */
    triggerScrape: async () => {
        const response = await api.post('/articles/scrape');
        return response.data;
    },
};
export default api;
//# sourceMappingURL=api.js.map