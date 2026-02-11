using Api.Data;
using Api.DTOs;
using Api.Models;
using Api.Security;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    const string schemeId = "Bearer";

    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Api", Version = "v1" });

    c.AddSecurityDefinition(schemeId, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(schemeId, document)] = []
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseSqlServer(cs);
});

builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
{
    var key = builder.Configuration["Jwt:Key"] ?? "";
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtTokenService>();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "API is running");

app.MapPost("/auth/register", async (RegisterRequest req, AppDbContext db, IEmailSender emailSender) =>
{
    var name = (req.Name ?? "").Trim();
    var email = (req.Email ?? "").Trim().ToLowerInvariant();
    var password = req.Password ?? "";

    if (name.Length == 0)
        return Results.BadRequest(new { message = "Name is required." });

    if (email.Length < 5 || !email.Contains('@'))
        return Results.BadRequest(new { message = "Invalid email." });

    if (password.Length == 0)
        return Results.BadRequest(new { message = "Password is required." });

    var user = new User
    {
        Id = Guid.NewGuid(),
        Name = name,
        Email = email,
        PasswordHash = PasswordHasher.Hash(password),
        Status = UserStatus.Unverified,
        EmailConfirmationToken = Guid.NewGuid().ToString("N"),
        EmailConfirmedAtUtc = null,
        CreatedAtUtc = DateTime.UtcNow,
        LastLoginAtUtc = null
    };

    db.Users.Add(user);

    try
    {
        await db.SaveChangesAsync();
    }
    catch (DbUpdateException ex) when (IsUniqueEmailViolation(ex))
    {
        return Results.Conflict(new { message = "Email is already registered." });
    }

    var baseUrl = builder.Configuration["App:PublicBaseUrl"] ?? "http://localhost:5242";

    var confirmLink = $"{baseUrl}/auth/confirm?token={user.EmailConfirmationToken}";

    _ = Task.Run(async () =>
    {
        try
        {
            await emailSender.SendAsync(user.Email,
                "Confirm your email", $"Hello {user.Name}, \n\nPlease Confirm Your Email\n{confirmLink}");
        }
        
        catch
        {

        }
    });

    return Results.Ok(new { message = "Registered. Please confirm your email." });
});

app.MapGet("/auth/confirm", async (string? token, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(token))
        return Results.BadRequest("Invalid token");

    var user = await db.Users.SingleOrDefaultAsync(u => u.EmailConfirmationToken == token);
    if (user is null)
        return Results.BadRequest("Invalid token");

    if (user.Status == UserStatus.Blocked)
        return Results.BadRequest("User is blocked");

    if (user.Status == UserStatus.Active)
        return Results.Ok("Already confirmed");

    user.Status = UserStatus.Active;
    user.EmailConfirmedAtUtc = DateTime.UtcNow;
    user.EmailConfirmationToken = "";

    await db.SaveChangesAsync();

    return Results.Ok("Email confirmed");
});

app.MapPost("/auth/login", async (LoginRequest req, AppDbContext db, JwtTokenService jwt) =>
{
    var email = (req.Email ?? "").Trim().ToLowerInvariant();
    var password = req.Password ?? "";

    if (email.Length < 5 || !email.Contains('@'))
        return Results.BadRequest(new { message = "Invalid email." });

    if (password.Length == 0)
        return Results.BadRequest(new { message = "Password is required." });

    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email);
    if (user is null)
        return Results.Json(new { message = "Invalid credentials." }, statusCode: 401);

    if (user.Status == UserStatus.Blocked)
        return Results.Json(new { message = "User is blocked." }, statusCode: 401);

    if (user.Status == UserStatus.Unverified)
        return Results.Json(new { message = "Confirm your email." }, statusCode: 401);

    if (!PasswordHasher.Verify(password, user.PasswordHash))
        return Results.BadRequest(new { message = "Invalid credentials." });

    user.LastLoginAtUtc = DateTime.UtcNow;
    await db.SaveChangesAsync();

    var token = jwt.GenerateToken(user);

    return Results.Ok(new
    {
        message = "Login successful",
        token,
        user = new { user.Id, user.Name, user.Email, status = user.Status.ToString() }
    });

});

static bool IsUniqueEmailViolation(DbUpdateException ex)
{
    if (ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx)
        return sqlEx.Number is 2601 or 2627;

    return false;
}

app.Run();