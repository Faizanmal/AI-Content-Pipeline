import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './globals.css';
import Header from './components/Header/Header';
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsxs("body", { children: [_jsx(Header, {}), _jsx("main", { className: "main-content", children: children })] }) }));
}
//# sourceMappingURL=layout.js.map