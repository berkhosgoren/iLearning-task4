using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Api.Security
{
    public sealed class JwtTokenService
    {
        private readonly IConfiguration _config;

        public JwtTokenService(IConfiguration config)
        {
            _config = config;
        }

        public string Create(User user)
        {
            var key = _config["Jwt:Key"] ?? "";
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new("status", user.Status.ToString())
            };

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(5),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);

        }
    }
}
