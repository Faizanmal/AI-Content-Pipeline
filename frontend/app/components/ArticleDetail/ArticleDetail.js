'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articleApi } from '../../lib/api';
import Loading from '../Loading/Loading';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './ArticleDetail.css';
const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch article');
            }
            finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);
    const formatDate = (dateString) => {
        if (!dateString)
            return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    if (loading) {
        return _jsx(Loading, { message: "Loading article..." });
    }
    if (error) {
        return _jsx(ErrorMessage, { message: error, onRetry: () => window.location.reload() });
    }
    if (!article) {
        return _jsx(ErrorMessage, { message: "Article not found" });
    }
    const isUpdated = article.version_type === 'updated';
    const references = article.references || [];
    return (_jsx("div", { className: "article-detail", children: _jsxs("div", { className: "article-detail__container", children: [_jsx(Link, { href: "/", className: "article-detail__back", children: "\u2190 Back to Articles" }), _jsxs("article", { className: "article-detail__content", children: [_jsxs("header", { className: "article-detail__header", children: [_jsxs("div", { className: "article-detail__badges", children: [_jsx("span", { className: `article-badge ${isUpdated ? 'badge--updated' : 'badge--original'}`, children: isUpdated ? '✨ Enhanced Version' : '📄 Original' }), article.status === 'draft' && (_jsx("span", { className: "article-badge badge--draft", children: "Draft" }))] }), _jsx("h1", { className: "article-detail__title", children: article.title }), _jsxs("div", { className: "article-detail__meta", children: [article.author && (_jsxs("span", { className: "meta-item", children: [_jsx("span", { className: "meta-icon", children: "\uD83D\uDC64" }), " ", article.author] })), _jsxs("span", { className: "meta-item", children: [_jsx("span", { className: "meta-icon", children: "\uD83D\uDCC5" }), " ", formatDate(article.published_date)] }), article.source_url && (_jsxs("a", { href: article.source_url, target: "_blank", rel: "noopener noreferrer", className: "meta-item meta-link", children: [_jsx("span", { className: "meta-icon", children: "\uD83D\uDD17" }), " View Source"] }))] }), isUpdated && article.original_article_id && (_jsx("div", { className: "article-detail__original-link", children: _jsx(Link, { href: `/articles/${article.original_article_id}`, children: "\uD83D\uDCC4 View Original Article" }) })), article.updated_versions && article.updated_versions.length > 0 && (_jsxs("div", { className: "article-detail__versions", children: [_jsx("span", { className: "versions-label", children: "Enhanced Versions:" }), article.updated_versions.map((version) => (_jsxs(Link, { href: `/articles/${version.id}`, className: "version-link", children: ["\u2728 Enhanced (", formatDate(version.published_date), ")"] }, version.id)))] }))] }), _jsx("div", { className: "article-detail__body", dangerouslySetInnerHTML: { __html: article.content } }), references.length > 0 && (_jsxs("section", { className: "article-detail__references", children: [_jsx("h2", { children: "\uD83D\uDCDA References" }), _jsx("p", { className: "references-intro", children: "This article was enhanced with insights from the following sources:" }), _jsx("ul", { className: "references-list", children: references.map((ref, index) => (_jsxs("li", { className: "reference-item", children: [_jsx("a", { href: ref.url, target: "_blank", rel: "noopener noreferrer", className: "reference-link", children: ref.title }), _jsxs("span", { className: "reference-domain", children: ["(", ref.domain, ")"] })] }, index))) })] }))] })] }) }));
};
export default ArticleDetail;
//# sourceMappingURL=ArticleDetail.js.map