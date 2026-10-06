using System.ComponentModel.DataAnnotations;
namespace Chef.api.Models.DTOs;

public class OrderItemResponseDto
{
    public string FoodId { get; set; } = string.Empty;
    public string FoodName { get; set; } = string.Empty;
    public int Litres { get; set; }
    public string ProteinOptionId { get; set; } = string.Empty;
    public string ProteinName { get; set; } = string.Empty;
    public decimal BaseLitrePrice { get; set; }
    public decimal DiscountedLitrePrice { get; set; }
    public decimal BaseDishTotal { get; set; }
    public string PepperLevel { get; set; } = string.Empty;
    public string SpiceLevel { get; set; } = string.Empty;
    public decimal ItemTotal { get; set; }
    public List<OrderItemExtraResponseDto> Extras { get; set; } = new();
}
