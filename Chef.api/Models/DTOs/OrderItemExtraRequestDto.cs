using System.ComponentModel.DataAnnotations;
namespace Chef.api.Models.DTOs;

public class OrderItemExtraRequestDto
{
    [Required]
    public string ExtraId { get; set; } = string.Empty;

    [Range(1, 50, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}