using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Chef.api.Models.DTOs;
using Chef.api.Services;

namespace Chef.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Public user registration. Unconditionally assigns normal User role on the server.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data) = await _authService.RegisterUserAsync(dto);
        if (!success)
        {
            return BadRequest(new { message = error });
        }

        return StatusCode(StatusCodes.Status201Created, data);
    }

    /// <summary>
    /// Public user login. Issues authoritative JWT with assigned role claims.
    /// Protected against brute-force attacks via rate limiting and temporary account lockout.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data) = await _authService.LoginUserAsync(dto);
        if (!success || data == null)
        {
            return Unauthorized(new { message = error ?? "Invalid email/username or password." });
        }

        return Ok(data);
    }

    /// <summary>
    /// Retrieves identity claims and profile details for the currently authenticated user.
    /// Accessible by any authenticated account (User or Admin).
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var profile = await _authService.GetCurrentUserProfileAsync(User);
        if (profile == null)
        {
            return NotFound(new { message = "User profile not found." });
        }

        return Ok(profile);
    }
}
