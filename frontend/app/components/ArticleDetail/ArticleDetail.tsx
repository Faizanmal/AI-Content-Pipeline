'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articleApi, Article } from '../../lib/api';
import Loading from '../Loading/Loading';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('Invalid article ID');
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await articleApi.getArticle(id);
        setArticle(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading message="Loading article..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (!article) {
    return <ErrorMessage message="Article not found" />;
  }

  const isUpdated = article.version_type === 'updated';
  const references = article.references || [];

  return (
    <div className="article-detail">
      <div className="article-detail__container">
        <Link href="/" className="article-detail__back">
          ← Back to Articles
        </Link>

        <article className="article-detail__content">
          <header className="article-detail__header">
            <div className="article-detail__badges">
              <span className={`article-badge ${isUpdated ? 'badge--updated' : 'badge--original'}`}>
                {isUpdated ? '✨ Enhanced Version' : '📄 Original'}
              </span>
              {article.status === 'draft' && (
                <span className="article-badge badge--draft">Draft</span>
              )}
            </div>

            <h1 className="article-detail__title">{article.title}</h1>

            <div className="article-detail__meta">
              {article.author && (
                <span className="meta-item">
                  <span className="meta-icon">👤</span> {article.author}
                </span>
              )}
              <span className="meta-item">
                <span className="meta-icon">📅</span> {formatDate(article.published_date)}
              </span>
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-item meta-link"
                >
                  <span className="meta-icon">🔗</span> View Source
                </a>
              )}
            </div>

            {isUpdated && article.original_article_id && (
              <div className="article-detail__original-link">
                <Link href={`/articles/${article.original_article_id}`}>
                  📄 View Original Article
                </Link>
              </div>
            )}

            {article.updated_versions && article.updated_versions.length > 0 && (
              <div className="article-detail__versions">
                <span className="versions-label">Enhanced Versions:</span>
                {article.updated_versions.map((version) => (
                  <Link
                    key={version.id}
                    href={`/articles/${version.id}`}
                    className="version-link"
                  >
                    ✨ Enhanced ({formatDate(version.published_date)})
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div
            className="article-detail__body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {references.length > 0 && (
            <section className="article-detail__references">
              <h2>📚 References</h2>
              <p className="references-intro">
                This article was enhanced with insights from the following sources:
              </p>
              <ul className="references-list">
                {references.map((ref, index) => (
                  <li key={index} className="reference-item">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reference-link"
                    >
                      {ref.title}
                    </a>
                    <span className="reference-domain">({ref.domain})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
