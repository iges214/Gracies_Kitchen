using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Chef.api.Data;
using Chef.api.Models.DTOs;
using Chef.api.Models.Entities;

namespace Chef.api.Services;

public class AuthService : IAuthService
{
    private readonly ChefDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthService> _logger;

    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private const string GenericAuthErrorMessage = "Invalid email/username or password.";

    public AuthService(
        ChefDbContext context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error, AuthResponseDto? Data)> RegisterUserAsync(RegisterDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var normalizedUsername = dto.Username.Trim().ToLowerInvariant();

        // 1. Check for duplicate email
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            return (false, "An account with this email address already exists.", null);
        }

        // 2. Check for duplicate username
        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == normalizedUsername))
        {
            return (false, "This username is already taken. Please choose another.", null);
        }

        // 3. Password Strength Validation (Min 8 chars, at least one digit and letter)
        if (dto.Password.Length < 8 || !dto.Password.Any(char.IsDigit) || !dto.Password.Any(char.IsLetter))
        {
            return (false, "Password must be at least 8 characters long and contain both letters and numbers.", null);
        }

        // 4. Secure Password Hashing via existing PBKDF2 standard
        var (hash, salt) = _passwordHasher.HashPassword(dto.Password);

        // 5. SECURITY: Authoritative Server-Side Role Assignment
        // Public registrations are ALWAYS assigned "User". Client cannot dictate role.
        var newUser = new User
        {
            Email = normalizedEmail,
            Username = normalizedUsername,
            FullName = dto.FullName.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = "User", // Strictly hardcoded on server
            CreatedAt = DateTime.UtcNow,
            AccessFailedCount = 0,
            LockoutEnd = null
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New user registered successfully: {Email} with role {Role}", newUser.Email, newUser.Role);

        // 6. Generate authoritative JWT Token
        var (token, expiresAt) = _jwtService.GenerateToken(newUser);

        var responseDto = new AuthResponseDto
        {
            Token = token,
            Email = newUser.Email,
            Username = newUser.Username,
            FullName = newUser.FullName,
            Role = newUser.Role,
            ExpiresAt = expiresAt
        };

        return (true, null, responseDto);
    }

    public async Task<(bool Success, string? Error, AuthResponseDto? Data)> LoginUserAsync(LoginDto dto)
    {
        return await AuthenticateInternalAsync(dto, requiredRole: null);
    }

    public async Task<(bool Success, string? Error, AuthResponseDto? Data)> LoginAdminAsync(LoginDto dto)
    {
        // Require authoritative Admin role for administrative portal logins
        return await AuthenticateInternalAsync(dto, requiredRole: "Admin");
    }

    public async Task<UserProfileDto?> GetCurrentUserProfileAsync(ClaimsPrincipal principal)
    {
        var idClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out int userId))
        {
            var emailClaim = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(emailClaim)) return null;

            var userByEmail = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailClaim.ToLower());

            return userByEmail == null ? null : MapToProfileDto(userByEmail);
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user == null ? null : MapToProfileDto(user);
    }

    private async Task<(bool Success, string? Error, AuthResponseDto? Data)> AuthenticateInternalAsync(
        LoginDto dto, 
        string? requiredRole)
    {
        var normalized = dto.EmailOrUsername.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized || u.Username.ToLower() == normalized);

        // If user not found, perform dummy verification to prevent timing attack enumeration
        if (user == null)
        {
            _passwordHasher.VerifyPassword("DummyPassword123!", "bW9ja0hhc2g=", "bW9ja1NhbHQ=");
            return (false, GenericAuthErrorMessage, null);
        }

        // 1. Brute-Force Check: Is account currently locked out?
        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            _logger.LogWarning("Login rejected for locked account {User}. Lockout remaining: {Minutes} min", dto.EmailOrUsername, remaining);
            return (false, $"Account is temporarily locked due to multiple failed login attempts. Please try again in {remaining} minute(s).", null);
        }

        // 2. Verify Password Cryptographically
        bool isPasswordValid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt);

        if (!isPasswordValid)
        {
            user.AccessFailedCount++;
            if (user.AccessFailedCount >= MaxFailedAttempts)
            {
                user.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                _logger.LogWarning("Account {User} locked until {LockoutEnd} after {Attempts} failed attempts.",
                    dto.EmailOrUsername, user.LockoutEnd, user.AccessFailedCount);
            }

            await _context.SaveChangesAsync();
            return (false, GenericAuthErrorMessage, null);
        }

        // 3. Role Authorization Check: If this is an Admin login, verify the account is an Admin
        if (!string.IsNullOrEmpty(requiredRole))
        {
            if (!string.Equals(user.Role, requiredRole, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Non-admin user {User} (Role: {Role}) attempted to authenticate via Admin portal.",
                    user.Email, user.Role);
                
                // Return generic error so unprivileged users do not learn internal security details
                return (false, GenericAuthErrorMessage, null);
            }
        }

        // 4. Reset Lockout State on successful authentication
        user.AccessFailedCount = 0;
        user.LockoutEnd = null;
        user.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // 5. Generate Authoritative JWT Token
        var (token, expiresAt) = _jwtService.GenerateToken(user);

        var responseDto = new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            ExpiresAt = expiresAt,
            RequiresTwoFactor = user.TwoFactorEnabled
        };

        return (true, null, responseDto);
    }

    private static UserProfileDto MapToProfileDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };
}
