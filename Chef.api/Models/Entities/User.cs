namespace Chef.api.Models.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Role is authoritative on server: "User" for regular customers, "Admin" for executive kitchen staff.
    /// </summary>
    public string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }

    /// <summary>
    /// Brute-force protection: number of consecutive failed login attempts.
    /// </summary>
    public int AccessFailedCount { get; set; } = 0;

    /// <summary>
    /// Brute-force protection: timestamp until which the account is temporarily locked.
    /// </summary>
    public DateTime? LockoutEnd { get; set; }

    /// <summary>
    /// Extensible 2FA / MFA support flag for future administrative security.
    /// </summary>
    public bool TwoFactorEnabled { get; set; } = false;

    /// <summary>
    /// TOTP or 2FA secret key (when enabled).
    /// </summary>
    public string? TwoFactorSecret { get; set; }
}
