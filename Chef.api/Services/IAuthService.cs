using System.Security.Claims;
using Chef.api.Models.DTOs;

namespace Chef.api.Services;

public interface IAuthService
{
    Task<(bool Success, string? Error, AuthResponseDto? Data)> RegisterUserAsync(RegisterDto dto);
    Task<(bool Success, string? Error, AuthResponseDto? Data)> LoginUserAsync(LoginDto dto);
    Task<(bool Success, string? Error, AuthResponseDto? Data)> LoginAdminAsync(LoginDto dto);
    Task<UserProfileDto?> GetCurrentUserProfileAsync(ClaimsPrincipal principal);
}
