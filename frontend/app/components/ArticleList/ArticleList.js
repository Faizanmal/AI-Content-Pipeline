'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { articleApi } from '../../lib/api';
import ArticleCard from '../ArticleCard/ArticleCard';
import Loading from '../Loading/Loading';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './ArticleList.css';
const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const fetchArticles = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                per_page: 10,
            };
            if (filter !== 'all') {
                params.version_type = filter;
            }
            const response = await articleApi.getArticles(params);
            setArticles(response.data);
            setPagination({
                currentPage: response.meta.current_page,
                lastPage: response.meta.last_page,
                total: response.meta.total,
            });
        }
        catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch articles');
        }
        finally {
            setLoading(false);
        }
    }, [filter]);
    useEffect(() => {
        fetchArticles(1);
    }, [fetchArticles]);
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };
    const handlePageChange = (page) => {
        fetchArticles(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (loading && articles.length === 0) {
        return _jsx(Loading, { message: "Loading articles..." });
    }
    if (error && articles.length === 0) {
        return _jsx(ErrorMessage, { message: error, onRetry: () => fetchArticles(1) });
    }
    return (_jsxs("div", { className: "article-list", children: [_jsxs("div", { className: "article-list__header", children: [_jsx("h1", { className: "article-list__title", children: "Articles" }), _jsx("p", { className: "article-list__subtitle", children: "Explore our collection of original and AI-enhanced articles" })] }), _jsxs("div", { className: "article-list__filters", children: [_jsxs("button", { className: `filter-button ${filter === 'all' ? 'filter-button--active' : ''}`, onClick: () => handleFilterChange('all'), children: ["All (", pagination.total, ")"] }), _jsx("button", { className: `filter-button ${filter === 'original' ? 'filter-button--active' : ''}`, onClick: () => handleFilterChange('original'), children: "\uD83D\uDCC4 Original" }), _jsx("button", { className: `filter-button ${filter === 'updated' ? 'filter-button--active' : ''}`, onClick: () => handleFilterChange('updated'), children: "\u2728 Enhanced" })] }), loading && _jsx(Loading, { message: "Updating..." }), !loading && articles.length === 0 && (_jsx("div", { className: "article-list__empty", children: _jsx("p", { children: "No articles found." }) })), _jsx("div", { className: "article-list__grid", children: articles.map((article) => (_jsx(ArticleCard, { article: article }, article.id))) }), pagination.lastPage > 1 && (_jsxs("div", { className: "article-list__pagination", children: [_jsx("button", { className: "pagination-button", disabled: pagination.currentPage === 1, onClick: () => handlePageChange(pagination.currentPage - 1), children: "\u2190 Previous" }), _jsxs("span", { className: "pagination-info", children: ["Page ", pagination.currentPage, " of ", pagination.lastPage] }), _jsx("button", { className: "pagination-button", disabled: pagination.currentPage === pagination.lastPage, onClick: () => handlePageChange(pagination.currentPage + 1), children: "Next \u2192" })] }))] }));
};
export default ArticleList;
//# sourceMappingURL=ArticleList.js.map