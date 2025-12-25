import React from 'react';
import Link from 'next/link';
import { Article } from '../../lib/api';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpdated = article.version_type === 'updated';

  return (
    <article className={`article-card ${isUpdated ? 'article-card--updated' : 'article-card--original'}`}>
      <div className="article-card__badge-container">
        <span className={`article-card__badge ${isUpdated ? 'badge--updated' : 'badge--original'}`}>
          {isUpdated ? '✨ Enhanced' : '📄 Original'}
        </span>
        {article.status === 'draft' && (
          <span className="article-card__badge badge--draft">Draft</span>
        )}
      </div>
      
      <Link href={`/articles/${article.id}`} className="article-card__link">
        <h2 className="article-card__title">{article.title}</h2>
      </Link>
      
      <div className="article-card__meta">
        {article.author && (
          <span className="article-card__author">
            <span className="meta-icon">👤</span> {article.author}
          </span>
        )}
        <span className="article-card__date">
          <span className="meta-icon">📅</span> {formatDate(article.published_date)}
        </span>
      </div>

      {isUpdated && article.original_article_id && (
        <div className="article-card__original-link">
          <Link href={`/articles/${article.original_article_id}`}>
            View original article →
          </Link>
        </div>
      )}

      {article.references && article.references.length > 0 && (
        <div className="article-card__references">
          <span className="references-label">📚 {article.references.length} references</span>
        </div>
      )}
    </article>
  );
};

export default ArticleCard;
