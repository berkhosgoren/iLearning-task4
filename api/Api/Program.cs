using Api.Data;
using Microsoft.EntityFrameworkCore;
using Api.DTOs;
using Api.Models;
using Api.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseSqlServer(cs);
});

var app = builder.Build(); 

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "API is running");

app.MapPost("/auth/register", async (RegisterRequest req, AppDbContext db) =>
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
        IsEmailConfirmed = false,
        Status = UserStatus.Unverified,
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

    return Results.Ok(new { message = "Registered. Please confirm your email." });
});

static bool IsUniqueEmailViolation(DbUpdateException ex)
{
    if (ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx)
        return sqlEx.Number is 2601 or 2627;

    return false;
}

app.Run();