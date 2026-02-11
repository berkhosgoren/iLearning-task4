using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace Api.Security
{
    public class UserAccessFilter : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(
            EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var http = context.HttpContext;

            if (!http.User.Identity?.IsAuthenticated ?? true)
                return await next(context);

            var userId = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub");
            
            if (string.IsNullOrEmpty(userId))
                return Results.Unauthorized();

            if (!Guid.TryParse(userId, out var uid))
                return Results.Unauthorized();

            var db = http.RequestServices.GetRequiredService<AppDbContext>();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == uid);

            if (user is null)
                return Results.Unauthorized();

            if (user.Status == UserStatus.Blocked)
                return Results.Json(new { message = "User blocked." }, statusCode: 401);

            return await next(context);

        }
    }
}
