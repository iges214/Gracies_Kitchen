using Chef.api.Models.DTOs;

namespace Chef.api.Services;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto dto);
    Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode);
}
