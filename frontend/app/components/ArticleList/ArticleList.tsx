'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { articleApi, Article } from '../../lib/api';
import ArticleCard from '../ArticleCard/ArticleCard';
import Loading from '../Loading/Loading';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './ArticleList.css';

interface Pagination {
  currentPage: number;
  lastPage: number;
  total: number;
}

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: { page: number; per_page: number; version_type?: string } = {
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
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handlePageChange = (page: number) => {
    fetchArticles(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && articles.length === 0) {
    return <Loading message="Loading articles..." />;
  }

  if (error && articles.length === 0) {
    return <ErrorMessage message={error} onRetry={() => fetchArticles(1)} />;
  }

  return (
    <div className="article-list">
      <div className="article-list__header">
        <h1 className="article-list__title">Articles</h1>
        <p className="article-list__subtitle">
          Explore our collection of original and AI-enhanced articles
        </p>
      </div>

      <div className="article-list__filters">
        <button
          className={`filter-button ${filter === 'all' ? 'filter-button--active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All ({pagination.total})
        </button>
        <button
          className={`filter-button ${filter === 'original' ? 'filter-button--active' : ''}`}
          onClick={() => handleFilterChange('original')}
        >
          📄 Original
        </button>
        <button
          className={`filter-button ${filter === 'updated' ? 'filter-button--active' : ''}`}
          onClick={() => handleFilterChange('updated')}
        >
          ✨ Enhanced
        </button>
      </div>

      {loading && <Loading message="Updating..." />}

      {!loading && articles.length === 0 && (
        <div className="article-list__empty">
          <p>No articles found.</p>
        </div>
      )}

      <div className="article-list__grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {pagination.lastPage > 1 && (
        <div className="article-list__pagination">
          <button
            className="pagination-button"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <button
            className="pagination-button"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
