import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import './Header.css';
const Header = () => {
    return (_jsx("header", { className: "header", children: _jsxs("div", { className: "header-container", children: [_jsxs(Link, { href: "/", className: "logo", children: [_jsx("span", { className: "logo-icon", children: "\uD83D\uDCDD" }), _jsx("span", { className: "logo-text", children: " Blog" })] }), _jsx("nav", { className: "nav", children: _jsx(Link, { href: "/", className: "nav-link", children: "Articles" }) })] }) }));
};
export default Header;
//# sourceMappingURL=Header.js.map