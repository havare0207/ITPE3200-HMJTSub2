using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HMJT.DTOs.Auth;
using HMJT.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HMJT.Controllers;

// Handles user registration and login for the API.
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }


    // =====================================
    // Register
    // =====================================

    // Creates a new user account.
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        // The API controller automatically validates
        // the data annotations in RegisterDto.
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        // Prevent duplicate accounts using the same email address.
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);

        if (existingUser is not null)
        {
            return Conflict(new
            {
                message = "An account with this email already exists."
            });
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        // ASP.NET Core Identity handles password hashing
        // and validates the password requirements configured in Program.cs.
        var result = await _userManager.CreateAsync(
            user,
            dto.Password
        );

        if (!result.Succeeded)
        {
            // Return Identity validation errors to the frontend.
            return BadRequest(new
            {
                message = "Unable to create the account.",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        _logger.LogInformation(
            "New user account registered successfully."
        );

        return Ok(new
        {
            message = "Account created successfully."
        });
    }


    // =====================================
    // Login
    // =====================================

    // Authenticates a user and returns a JWT token.
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is null)
        {
            // Use a generic message so the API does not reveal
            // whether a particular email address exists.
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        // Verify the password using ASP.NET Core Identity.
        var passwordResult =
            await _signInManager.CheckPasswordSignInAsync(
                user,
                dto.Password,
                lockoutOnFailure: false
            );

        if (!passwordResult.Succeeded)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var authResponse = CreateToken(user);

        _logger.LogInformation(
            "User logged in successfully."
        );

        return Ok(authResponse);
    }


    // =====================================
    // JWT creation
    // =====================================

    // Creates a signed JWT token for an authenticated user.
    private AuthResponseDto CreateToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT key is missing from configuration."
            );

        var jwtIssuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT issuer is missing from configuration."
            );

        var jwtAudience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT audience is missing from configuration."
            );

        // Tokens remain valid for two hours so a typical
        // Code Pursuit game session can finish without interruption.
        var expiresAt = DateTime.UtcNow.AddHours(2);

        var claims = new List<Claim>
        {
            // Unique user identifier.
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id
            ),

            // User email.
            new(
                JwtRegisteredClaimNames.Email,
                user.Email ?? string.Empty
            ),

            // Unique identifier for this token.
            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()
            ),

            // Makes the Identity user ID available through User.FindFirst.
            new(
                ClaimTypes.NameIdentifier,
                user.Id
            ),

            new(
                ClaimTypes.Name,
                user.Email ?? string.Empty
            )
        };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
            );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler()
                .WriteToken(token),

            Email = user.Email ?? string.Empty,

            ExpiresAt = expiresAt
        };
    }
}