using System;

namespace Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null;

        public string Email { get; set; } = null;

        public string PasswordHash { get; set; } = null;

        public bool IsEmailConfirmed { get; set; }

        public UserStatus Status { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? LastLoginAtUtc { get; set; }

    }
    
    public enum UserStatus
    {
        Unverified = 0,
        Active = 1,
        Blocked = 2
    }
}
