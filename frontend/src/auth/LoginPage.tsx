import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form input values.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Feedback shown to the user.
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================
    // Form submission
    // =====================================

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();

        setError("");

        try {
            setLoading(true);

            // AuthContext sends the login request,
            // stores the JWT token and updates auth state.
            await login({
                email,
                password
            });

            // Send the user back to the Home page
            // after a successful login.
            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to log in."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="auth-page">

            {/* =====================================
                Login card
                ===================================== */}

            <section
                className="auth-card"
                aria-labelledby="login-heading"
            >
                <div className="auth-card-header">

                    <div
                        className="auth-icon"
                        aria-hidden="true"
                    >
                        <i className="bi bi-box-arrow-in-right" />
                    </div>

                    <p className="auth-eyebrow">
                        Welcome Back
                    </p>

                    <h1
                        id="login-heading"
                        className="auth-title"
                    >
                        Log in
                    </h1>

                    <p className="auth-subtitle">
                        Log in to your Code Pursuit account to access
                        saved games, notes and other account-specific
                        features.
                    </p>

                </div>


                {/* Display authentication errors. */}
                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}


                {/* =====================================
                    Login form
                    ===================================== */}

                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="mb-3">
                        <label
                            htmlFor="login-email"
                            className="form-label"
                        >
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            required
                        />
                    </div>


                    {/* Password */}
                    <div className="mb-4">
                        <label
                            htmlFor="login-password"
                            className="form-label"
                        >
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </div>


                    {/* Submit login. */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Log in"}
                    </button>

                </form>


                {/* =====================================
                    Registration link
                    ===================================== */}

                <p className="auth-switch-text">
                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </section>

        </div>
    );
}

export default LoginPage;