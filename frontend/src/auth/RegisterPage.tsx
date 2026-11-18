import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "./AuthService";


// =====================================
// Password validation
// =====================================

// Password rules used by both the frontend form
// and the ASP.NET Core Identity configuration.
const passwordRules = {
    minimumLength: 10,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    specialCharacter: /[^A-Za-z0-9]/
};


// =====================================
// Register page
// =====================================

function RegisterPage() {
    const navigate = useNavigate();

    // Form input values.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Feedback shown to the user.
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================
    // Client-side password validation
    // =====================================

    function validatePassword(): string | null {
        if (password.length < passwordRules.minimumLength) {
            return "Password must contain at least 10 characters.";
        }

        if (!passwordRules.uppercase.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }

        if (!passwordRules.lowercase.test(password)) {
            return "Password must contain at least one lowercase letter.";
        }

        if (!passwordRules.number.test(password)) {
            return "Password must contain at least one number.";
        }

        if (!passwordRules.specialCharacter.test(password)) {
            return "Password must contain at least one special character.";
        }

        if (password !== confirmPassword) {
            return "Password and confirmation password must match.";
        }

        return null;
    }


    // =====================================
    // Form submission
    // =====================================

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();

        setError("");

        const passwordError = validatePassword();

        if (passwordError) {
            setError(passwordError);
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                email,
                password,
                confirmPassword
            });

            // After successful registration,
            // send the user to the Login page.
            navigate("/login");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create the account."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="auth-page">

            {/* =====================================
                Register card
                ===================================== */}

            <section
                className="auth-card"
                aria-labelledby="register-heading"
            >
                <div className="auth-card-header">

                    <div
                        className="auth-icon"
                        aria-hidden="true"
                    >
                        <i className="bi bi-person-plus-fill" />
                    </div>

                    <p className="auth-eyebrow">
                        Create Account
                    </p>

                    <h1
                        id="register-heading"
                        className="auth-title"
                    >
                        Register
                    </h1>

                    <p className="auth-subtitle">
                        Create your Code Pursuit account to save
                        custom games and access account-specific features.
                    </p>

                </div>


                {/* Display registration errors. */}
                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}


                {/* =====================================
                    Registration form
                    ===================================== */}

                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="mb-3">
                        <label
                            htmlFor="register-email"
                            className="form-label"
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
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
                    <div className="mb-3">
                        <label
                            htmlFor="register-password"
                            className="form-label"
                        >
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            minLength={10}
                            required
                        />

                        <div
                            className="form-text"
                            id="password-help"
                        >
                            Use at least 10 characters with uppercase,
                            lowercase, a number and a special character.
                        </div>
                    </div>


                    {/* Confirm password */}
                    <div className="mb-4">
                        <label
                            htmlFor="register-confirm-password"
                            className="form-label"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="register-confirm-password"
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            minLength={10}
                            required
                        />
                    </div>


                    {/* Submit registration. */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>

                </form>


                {/* =====================================
                    Login link
                    ===================================== */}

                <p className="auth-switch-text">
                    Already have an account?{" "}

                    <Link to="/login">
                        Log in
                    </Link>
                </p>

            </section>

        </div>
    );
}

export default RegisterPage;