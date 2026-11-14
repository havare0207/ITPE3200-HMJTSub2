function PrivacyPage() {
    return (
        <div className="privacy-page">

            {/* =====================================
                Page introduction
                ===================================== */}

            <section
                className="privacy-intro mb-5"
                aria-labelledby="privacy-heading"
            >
               
                <h1
                    id="privacy-heading"
                    className="privacy-title"
                >
                    Privacy and Account Security
                </h1>

                <p className="privacy-intro-text">
                    This page explains how Code Pursuit handles account information,
                    password security, authentication, login protection and access to
                    account-specific features such as custom games. It also describes
                    how user credentials are protected and how authenticated access is
                    used throughout the application.
                </p>
            </section>


            {/* =====================================
                Account information
                ===================================== */}

            <section
                className="privacy-card mb-4"
                aria-labelledby="account-information-heading"
            >
                <div
                    className="privacy-card-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-person-circle" />
                </div>

                <div>
                    <h2
                        id="account-information-heading"
                        className="privacy-card-title"
                    >
                        Account Information
                    </h2>

                    <p>
                        Code Pursuit uses ASP.NET Core Identity to manage
                        registered users and account security.
                    </p>

                    <p className="mb-0">
                        When a user registers, their email address is stored
                        so that it can be used to identify their account
                        and authenticate them when they log in.
                    </p>
                </div>
            </section>


            {/* =====================================
                Password security
                ===================================== */}

            <section
                className="privacy-card mb-4"
                aria-labelledby="password-security-heading"
            >
                <div
                    className="privacy-card-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-shield-lock-fill" />
                </div>

                <div>
                    <h2
                        id="password-security-heading"
                        className="privacy-card-title"
                    >
                        Password Security
                    </h2>

                    <p>
                        Passwords are never stored as plain text in the
                        database. ASP.NET Core Identity securely hashes
                        passwords before they are stored.
                    </p>

                    <p>
                        The stored value is a salted password hash rather
                        than the original password. This means that Code
                        Pursuit does not need to store or retrieve the
                        user's original password after registration.
                    </p>

                    <p>
                        When a user logs in, the entered password is
                        verified against the stored password hash by
                        ASP.NET Core Identity.
                    </p>

                    <p className="mb-0">
                        Passwords must contain at least one uppercase
                        letter, one lowercase letter, one number and one
                        special character, in addition to meeting the
                        configured minimum password length.
                    </p>
                </div>
            </section>


            {/* =====================================
                Login protection
                ===================================== */}

            <section
                className="privacy-card mb-4"
                aria-labelledby="login-protection-heading"
            >
                <div
                    className="privacy-card-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-key-fill" />
                </div>

                <div>
                    <h2
                        id="login-protection-heading"
                        className="privacy-card-title"
                    >
                        Login Protection
                    </h2>

                    <p>
                        Authentication is handled by the backend using
                        ASP.NET Core Identity together with JSON Web Tokens
                        (JWT).
                    </p>

                    <p>
                        After a successful login, the API issues a token
                        that is used by the frontend when requesting
                        protected resources.
                    </p>

                    <p className="mb-0">
                        Protected API endpoints verify the authentication
                        token before allowing access to account-specific
                        functionality.
                    </p>
                </div>
            </section>


            {/* =====================================
                Custom games
                ===================================== */}

            <section
                className="privacy-card mb-4"
                aria-labelledby="custom-games-heading"
            >
                <div
                    className="privacy-card-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-controller" />
                </div>

                <div>
                    <h2
                        id="custom-games-heading"
                        className="privacy-card-title"
                    >
                        Custom Games
                    </h2>

                    <p className="mb-0">
                        Saved custom games are associated with the account
                        that created them. A logged-in user should only be
                        able to access and manage custom games belonging
                        to their own account.
                    </p>
                </div>
            </section>


            {/* =====================================
                Application scope
                ===================================== */}

            <section
                className="privacy-note"
                aria-labelledby="privacy-note-heading"
            >
                <div
                    className="privacy-note-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-info-circle-fill" />
                </div>

                <div>
                    <h2
                        id="privacy-note-heading"
                        className="h5"
                    >
                        About this application
                    </h2>

                    <p className="mb-0">
                        Code Pursuit is a student project developed as
                        part of ITPE3200. Account information is used only
                        for functionality provided by the application.
                    </p>
                </div>
            </section>

        </div>
    );
}

export default PrivacyPage;