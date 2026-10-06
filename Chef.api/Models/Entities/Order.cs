namespace Chef.api.Models.Entities;

public class Order
{
    public int Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public DateTime RequestedDeliveryTime { get; set; }
    public string? OrderNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";

    public decimal Subtotal { get; set; }
    public decimal VolumeDiscountSavings { get; set; }
    public decimal GrandTotal { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
