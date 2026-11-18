// Base URL for authentication endpoints.
const AUTH_API_URL = "http://localhost:5234/api/auth";


// =====================================
// Types
// =====================================

// Data sent to the backend when registering a new account.
export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
}

// Data sent to the backend when logging in.
export interface LoginRequest {
    email: string;
    password: string;
}

// Data returned by the backend after a successful login.
export interface AuthResponse {
    token: string;
    email: string;
    expiresAt: string;
}


// =====================================
// Response handling
// =====================================

// Reads API responses and converts backend errors
// into readable frontend error messages.
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const errorData = await response.json();

            // Identity validation errors may be returned as an array.
            if (
                Array.isArray(errorData.errors) &&
                errorData.errors.length > 0
            ) {
                message = errorData.errors.join(" ");
            } else {
                message =
                    errorData.message ||
                    errorData.detail ||
                    errorData.title ||
                    message;
            }
        } catch {
            // The response may not contain JSON.
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    return await response.json();
}


// =====================================
// Register
// =====================================

// Creates a new Code Pursuit account.
export async function registerUser(
    registerData: RegisterRequest
): Promise<{ message: string }> {
    const response = await fetch(
        `${AUTH_API_URL}/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData)
        }
    );

    return handleResponse<{ message: string }>(response);
}


// =====================================
// Login
// =====================================

// Logs in a user and returns their JWT authentication data.
export async function loginUser(
    loginData: LoginRequest
): Promise<AuthResponse> {
    const response = await fetch(
        `${AUTH_API_URL}/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        }
    );

    return handleResponse<AuthResponse>(response);
}