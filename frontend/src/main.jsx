
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bootstrap styling
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap icons
import "bootstrap-icons/font/bootstrap-icons.css";

// Bootstrap JavaScript for responsive navigation and interactive components
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Your own application styling
import "./site.css";

// Main application component
import App from "./App.jsx";

// Authentication context provider
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);
