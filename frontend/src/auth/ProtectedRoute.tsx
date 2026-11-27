import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children
}: ProtectedRouteProps) {
    const {
        isAuthenticated,
        isLoading
    } = useAuth();

    // Wait until the stored authentication state
    // has been restored before checking access.
    if (isLoading) {
        return (
            <p role="status" aria-live="polite">
                Loading...
            </p>
        );
    }

    // Redirect unauthenticated users to the login page.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}