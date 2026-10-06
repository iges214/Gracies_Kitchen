using System.ComponentModel.DataAnnotations;

namespace Chef.api.Models.DTOs;

public class UpdateOrderStatusDto
{
    [Required(ErrorMessage = "Order status is required.")]
    public string Status { get; set; } = string.Empty;

    public string? AdminNote { get; set; }
}
