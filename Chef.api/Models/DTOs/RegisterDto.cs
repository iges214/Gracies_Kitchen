using System.ComponentModel.DataAnnotations;

namespace Chef.api.Models.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username is required.")]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters.")]
    [MaxLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(150, ErrorMessage = "Full name cannot exceed 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Please provide a valid phone number.")]
    [MaxLength(50)]
    public string? PhoneNumber { get; set; }

    // SECURITY: There is intentionally NO Role property in this DTO.
    // Public registrations are unconditionally assigned Role = "User" on the server.
}
