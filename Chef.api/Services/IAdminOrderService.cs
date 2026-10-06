using Chef.api.Models.DTOs;

namespace Chef.api.Services;

public interface IAdminOrderService
{
    Task<AdminAuthResponseDto?> AuthenticateAdminAsync(string emailOrUsername, string password);
    Task<List<OrderResponseDto>> GetOrdersAsync(string? status, string? search, int page = 1, int pageSize = 50);
    Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode);
    Task<OrderResponseDto> UpdateOrderStatusAsync(string orderCode, string newStatus, string? adminNote);
    Task<List<CustomerSummaryDto>> GetCustomersAsync(string? search);
    Task<List<OrderResponseDto>> GetCustomerOrdersAsync(string customerEmail);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
