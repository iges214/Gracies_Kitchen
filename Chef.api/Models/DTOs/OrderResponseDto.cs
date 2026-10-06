using System.ComponentModel.DataAnnotations;
namespace Chef.api.Models.DTOs;

public class OrderResponseDto
{
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public DateTime RequestedDeliveryTime { get; set; }
    public string? OrderNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
    public decimal VolumeDiscountSavings { get; set; }
    public decimal GrandTotal { get; set; }

    public string TrackingUrl { get; set; } = string.Empty;

    public List<OrderItemResponseDto> Items { get; set; } = new();
}