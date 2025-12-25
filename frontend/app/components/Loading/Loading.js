import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Loading.css';
const Loading = ({ message = 'Loading...' }) => {
    return (_jsxs("div", { className: "loading", children: [_jsx("div", { className: "loading__spinner" }), _jsx("p", { className: "loading__message", children: message })] }));
};
export default Loading;
//# sourceMappingURL=Loading.js.map