
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bootstrap styling
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap JavaScript for responsive navigation and interactive components
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Your own application styling
import "./site.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
