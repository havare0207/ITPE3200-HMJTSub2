using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Auth;

// Data received from the frontend when a user logs in.
public class LoginDto
{
    // Email is used to identify the registered account.
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    // Password is verified by ASP.NET Core Identity.
    [Required]
    public string Password { get; set; } = string.Empty;
}