using System.ComponentModel.DataAnnotations;
namespace Chef.api.Models.DTOs;

public class OrderItemExtraResponseDto
{
    public string ExtraProteinId { get; set; } = string.Empty;
    public string ExtraProteinName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
