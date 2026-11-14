using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Auth;

// Data received from the frontend when a new user registers.
public class RegisterDto
{
    // Email is used as the username for authentication.
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    // Password must contain at least 10 characters
    // and meet the Identity requirements configured in Program.cs.
    [Required]
    [MinLength(10)]
    public string Password { get; set; } = string.Empty;

    // Used to verify that the user entered
    // the intended password correctly.
    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = string.Empty;
}