'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ErrorMessage.css';
const ErrorMessage = ({ message, onRetry }) => {
    return (_jsxs("div", { className: "error-message", children: [_jsx("div", { className: "error-message__icon", children: "\u26A0\uFE0F" }), _jsx("h3", { className: "error-message__title", children: "Something went wrong" }), _jsx("p", { className: "error-message__text", children: message }), onRetry && (_jsx("button", { className: "error-message__button", onClick: onRetry, children: "Try Again" }))] }));
};
export default ErrorMessage;
//# sourceMappingURL=ErrorMessage.js.map