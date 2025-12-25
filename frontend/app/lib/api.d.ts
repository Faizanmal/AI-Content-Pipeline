export interface Article {
    id: number;
    title: string;
    content: string;
    author?: string;
    published_date?: string;
    source_url?: string;
    status: string;
    version_type: 'original' | 'updated';
    original_article_id?: number;
    updated_versions?: Article[];
    references?: {
        url: string;
        title: string;
        domain: string;
    }[];
}
export interface ArticlesResponse {
    data: Article[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}
declare const api: import("axios").AxiosInstance;
export declare const articleApi: {
    /**
     * Get all articles with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<ArticlesResponse>} - Articles data
     */
    getArticles: (params?: {
        page?: number;
        per_page?: number;
        version_type?: string;
    }) => Promise<ArticlesResponse>;
    /**
     * Get a single article by ID
     * @param {string | number} id - Article ID
     * @returns {Promise<Article>} - Article data
     */
    getArticle: (id: string | number) => Promise<Article>;
    /**
     * Trigger scraping
     * @returns {Promise<Object>} - Response
     */
    triggerScrape: () => Promise<any>;
};
export default api;
//# sourceMappingURL=api.d.ts.map