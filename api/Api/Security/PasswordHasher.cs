using System.Security.Cryptography;
using System.Text;

namespace Api.Security
{
    public static class PasswordHasher
    {
        public static string Hash(string password)
        {
           using var sha = SHA256.Create();
           var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

    public static bool Verify(string password, string hash)
        {
            var computed = Hash(password);
            return computed == hash;
        }
    }
}
