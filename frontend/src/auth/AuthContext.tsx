import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import {
    loginUser,
    type AuthResponse,
    type LoginRequest
} from "./AuthService";


// =====================================
// Types
// =====================================

// Describes the authentication data and functions
// available to components using this context.
interface AuthContextValue {
    token: string | null;
    email: string | null;
    isAuthenticated: boolean;
    login: (loginData: LoginRequest) => Promise<void>;
    logout: () => void;
}


// Props accepted by the AuthProvider component.
interface AuthProviderProps {
    children: ReactNode;
}


// =====================================
// Local storage keys
// =====================================

const TOKEN_KEY = "codePursuitToken";
const EMAIL_KEY = "codePursuitEmail";
const EXPIRY_KEY = "codePursuitTokenExpiry";


// =====================================
// Authentication context
// =====================================

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);


// =====================================
// Auth provider
// =====================================

export function AuthProvider({
    children
}: AuthProviderProps) {
    // Stores the current JWT token.
    const [token, setToken] = useState<string | null>(null);

    // Stores the email of the authenticated user.
    const [email, setEmail] = useState<string | null>(null);


    // =====================================
    // Restore existing login
    // =====================================

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedEmail = localStorage.getItem(EMAIL_KEY);
        const storedExpiry = localStorage.getItem(EXPIRY_KEY);

        // If any required authentication value is missing,
        // there is no valid stored login to restore.
        if (!storedToken || !storedEmail || !storedExpiry) {
            return;
        }

        const expiresAt = new Date(storedExpiry);

        // Remove expired authentication data.
        if (
            Number.isNaN(expiresAt.getTime()) ||
            expiresAt <= new Date()
        ) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
            localStorage.removeItem(EXPIRY_KEY);

            return;
        }

        // Restore the active login.
        setToken(storedToken);
        setEmail(storedEmail);
    }, []);


    // =====================================
    // Login
    // =====================================

    async function login(
        loginData: LoginRequest
    ): Promise<void> {
        const response: AuthResponse =
            await loginUser(loginData);

        // Save authentication data so the user remains
        // logged in if the page is refreshed.
        localStorage.setItem(
            TOKEN_KEY,
            response.token
        );

        localStorage.setItem(
            EMAIL_KEY,
            response.email
        );

        localStorage.setItem(
            EXPIRY_KEY,
            response.expiresAt
        );

        setToken(response.token);
        setEmail(response.email);
    }


    // =====================================
    // Logout
    // =====================================

    function logout(): void {
        // Remove authentication data from the browser.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        localStorage.removeItem(EXPIRY_KEY);

        setToken(null);
        setEmail(null);
    }


    // The user is authenticated when both a token
    // and an email address are available.
    const isAuthenticated =
        token !== null && email !== null;


    return (
        <AuthContext.Provider
            value={{
                token,
                email,
                isAuthenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


// =====================================
// Auth hook
// =====================================

// Provides convenient access to authentication state
// from components inside AuthProvider.
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            "useAuth must be used inside an AuthProvider."
        );
    }

    return context;
}