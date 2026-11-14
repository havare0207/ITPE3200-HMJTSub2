using System.Text;
using HMJT.DAL;
using HMJT.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


// =====================================
// Controllers and JSON
// =====================================

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Prevents circular reference errors
    // such as Game <-> Question in JSON responses.
    options.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddOpenApi();


// =====================================
// Database contexts
// =====================================

builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("GameDbConnection")
    ));

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("AuthDbConnection")
    ));


// =====================================
// ASP.NET Core Identity
// =====================================

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        // Password requirements used when registering an account.
        options.Password.RequiredLength = 10;

        // Require at least one uppercase letter.
        options.Password.RequireUppercase = true;

        // Require at least one lowercase letter.
        options.Password.RequireLowercase = true;

        // Require at least one number.
        options.Password.RequireDigit = true;

        // Require at least one special character.
        options.Password.RequireNonAlphanumeric = true;

        // Email addresses must be unique.
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddSignInManager();


// =====================================
// JWT authentication
// =====================================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT key is missing from configuration."
    );

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException(
        "JWT issuer is missing from configuration."
    );

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException(
        "JWT audience is missing from configuration."
    );


builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                // Verify that the token was created
                // by the expected API.
                ValidateIssuer = true,

                // Verify that the token is intended
                // for the expected client/application.
                ValidateAudience = true,

                // Verify that the token has not expired.
                ValidateLifetime = true,

                // Verify the token signature.
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                // Avoid allowing extra time after token expiration.
                ClockSkew = TimeSpan.Zero
            };
    });


builder.Services.AddAuthorization();


// =====================================
// CORS
// =====================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy
            .SetIsOriginAllowed(origin =>
                new Uri(origin).Host == "localhost"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
    );
});


// =====================================
// Repositories
// =====================================

builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IPresetQuestionRepository, PresetQuestionRepository>();
builder.Services.AddScoped<INotesRepository, NotesRepository>();


// =====================================
// Build application
// =====================================

var app = builder.Build();


// =====================================
// Development configuration
// =====================================

if (app.Environment.IsDevelopment())
{
    DBInit.Seed(app);

    app.MapOpenApi();
    app.MapScalarApiReference();
}


// =====================================
// Middleware
// =====================================

app.UseCors("CorsPolicy");

// Authentication must run before authorization.
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllers();

app.Run();