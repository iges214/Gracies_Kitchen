namespace Chef.api.Models.DTOs;

public class DashboardStatsDto
{
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ActiveTickets { get; set; }
    public int DeliveredOrders { get; set; }
    public int PendingOrders { get; set; }
    public Dictionary<string, int> StatusBreakdown { get; set; } = new();
    public List<OrderResponseDto> RecentOrders { get; set; } = new();
}
