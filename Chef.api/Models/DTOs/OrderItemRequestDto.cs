using System.ComponentModel.DataAnnotations;
namespace Chef.api.Models.DTOs;

public class OrderItemRequestDto
{
    [Required]
    public string FoodId { get; set; } = string.Empty;

    [Range(1, 20, ErrorMessage = "Litres must be between 1 and 20.")]
    public int Litres { get; set; }

    [Required]
    public string ProteinOptionId { get; set; } = string.Empty;

    public string PepperLevel { get; set; } = "Medium";
    public string SpiceLevel { get; set; } = "Standard";

    public List<OrderItemExtraRequestDto> Extras { get; set; } = new();
}