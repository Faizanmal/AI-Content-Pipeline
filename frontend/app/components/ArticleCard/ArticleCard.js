import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import './ArticleCard.css';
const ArticleCard = ({ article }) => {
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
    const isUpdated = article.version_type === 'updated';
    return (_jsxs("article", { className: `article-card ${isUpdated ? 'article-card--updated' : 'article-card--original'}`, children: [_jsxs("div", { className: "article-card__badge-container", children: [_jsx("span", { className: `article-card__badge ${isUpdated ? 'badge--updated' : 'badge--original'}`, children: isUpdated ? '✨ Enhanced' : '📄 Original' }), article.status === 'draft' && (_jsx("span", { className: "article-card__badge badge--draft", children: "Draft" }))] }), _jsx(Link, { href: `/articles/${article.id}`, className: "article-card__link", children: _jsx("h2", { className: "article-card__title", children: article.title }) }), _jsxs("div", { className: "article-card__meta", children: [article.author && (_jsxs("span", { className: "article-card__author", children: [_jsx("span", { className: "meta-icon", children: "\uD83D\uDC64" }), " ", article.author] })), _jsxs("span", { className: "article-card__date", children: [_jsx("span", { className: "meta-icon", children: "\uD83D\uDCC5" }), " ", formatDate(article.published_date)] })] }), isUpdated && article.original_article_id && (_jsx("div", { className: "article-card__original-link", children: _jsx(Link, { href: `/articles/${article.original_article_id}`, children: "View original article \u2192" }) })), article.references && article.references.length > 0 && (_jsx("div", { className: "article-card__references", children: _jsxs("span", { className: "references-label", children: ["\uD83D\uDCDA ", article.references.length, " references"] }) }))] }));
};
export default ArticleCard;
//# sourceMappingURL=ArticleCard.js.map