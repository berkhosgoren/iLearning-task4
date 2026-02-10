using System;

namespace Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = "";

        public string Email { get; set; } = "";

        public string PasswordHash { get; set; } = "";

        public UserStatus Status { get; set; } = UserStatus.Unverified;

        public string EmailConfirmationToken { get; set; } = "";

        public DateTime? EmailConfirmedAtUtc { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAtUtc { get; set; }

    }
    
    public enum UserStatus
    {
        Unverified = 0,
        Active = 1,
        Blocked = 2
    }
}
