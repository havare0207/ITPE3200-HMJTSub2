namespace HMJT.DTOs.Auth;

// Data returned to the frontend after a successful login.
public class AuthResponseDto
{
    // JWT token used for authenticated API requests.
    public string Token { get; set; } = string.Empty;

    // Email of the authenticated user.
    public string Email { get; set; } = string.Empty;

    // Token expiration time in UTC.
    public DateTime ExpiresAt { get; set; }
}