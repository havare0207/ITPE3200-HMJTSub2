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
                    This page explains how Code Pursuit handles account
                    information, password security, authentication and
                    access to account-specific features. It also describes
                    how user credentials and custom games are protected.
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
                        to identify their account and allow them to log in.
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
                        Passwords are not stored as plain text in the
                        database. ASP.NET Core Identity stores salted
                        password hashes instead of the original passwords.
                    </p>

                    <p>
                        During login, the entered password is verified
                        against the stored password hash.
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
                Authentication and authorization
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
                        Authentication and Authorization
                    </h2>

                    <p>
                        Authentication is handled by the backend using
                        ASP.NET Core Identity and JSON Web Tokens (JWT).
                    </p>

                    <p>
                        After a successful login, the API issues an
                        authentication token that the frontend includes
                        when requesting protected resources.
                    </p>

                    <p>
                        The backend validates authentication tokens
                        and checks whether users are authorized to
                        access the requested resources.
                    </p>

                    <p className="mb-0">
                        Standard Game can be played without an account,
                        while account-specific features such as Custom
                        Games require authentication.
                    </p>
                </div>
            </section>


            {/* =====================================
                Custom game security
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

                    <p>
                        Saved custom games are associated with the account
                        that created them. Authenticated users can only
                        access, manage and start custom games belonging
                        to their own account.
                    </p>

                    <p>
                        The backend verifies authentication and ownership
                        before allowing gameplay requests to access or
                        modify an active Custom Game session.
                    </p>

                    <p className="mb-0">
                        Unauthenticated requests and unauthorized access
                        to another user's custom games or gameplay
                        sessions are rejected by the backend.
                    </p>
                </div>
            </section>


            {/* =====================================
                Session management
                ===================================== */}

            <section
                className="privacy-card mb-4"
                aria-labelledby="session-management-heading"
            >
                <div
                    className="privacy-card-icon"
                    aria-hidden="true"
                >
                    <i className="bi bi-clock-history" />
                </div>

                <div>
                    <h2
                        id="session-management-heading"
                        className="privacy-card-title"
                    >
                        Session Management
                    </h2>

                    <p>
                        The authentication token, email address and
                        token expiration information are stored in
                        the browser's local storage to maintain the
                        user's login state when refreshing the page.
                    </p>

                    <p>
                        Access to protected resources requires a
                        valid authentication token.
                    </p>

                    <p className="mb-0">
                        Logging out removes the locally stored
                        authentication information from the browser.
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
                        part of ITPE3200. Account information supports
                        authentication, account management and
                        personalized application functionality.
                    </p>
                </div>
            </section>

        </div>
    );
}

export default PrivacyPage;