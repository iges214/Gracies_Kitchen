namespace Chef.api.Models.DTOs;

public class CustomerSummaryDto
{
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime FirstOrderDate { get; set; }
    public DateTime LastOrderDate { get; set; }
    public string LatestOrderStatus { get; set; } = string.Empty;
}
