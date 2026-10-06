using Microsoft.EntityFrameworkCore;
using Chef.api.Data;
using Chef.api.Models.DTOs;
using Chef.api.Models.Entities;

namespace Chef.api.Services;

public class AdminOrderService : IAdminOrderService
{
    private readonly ChefDbContext _context;
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminOrderService> _logger;

    public AdminOrderService(
        ChefDbContext context,
        IAuthService authService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AdminOrderService> logger)
    {
        _context = context;
        _authService = authService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AdminAuthResponseDto?> AuthenticateAdminAsync(string emailOrUsername, string password)
    {
        var (success, error, data) = await _authService.LoginAdminAsync(new LoginDto
        {
            EmailOrUsername = emailOrUsername,
            Password = password
        });

        if (!success || data == null)
        {
            _logger.LogWarning("Admin authentication failed for {User}: {Error}", emailOrUsername, error);
            return null;
        }

        return new AdminAuthResponseDto
        {
            Token = data.Token,
            Email = data.Email,
            FullName = data.FullName,
            Role = data.Role,
            ExpiresAt = data.ExpiresAt
        };
    }

    public async Task<List<OrderResponseDto>> GetOrdersAsync(string? status, string? search, int page = 1, int pageSize = 50)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o =>
                o.OrderCode.ToLower().Contains(s) ||
                o.CustomerName.ToLower().Contains(s) ||
                o.CustomerEmail.ToLower().Contains(s) ||
                o.CustomerPhone.ToLower().Contains(s));
        }

        var baseUrl = GetBaseFrontendUrl();

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return orders.Select(o => MapToResponseDto(o, $"{baseUrl}/?track={o.OrderCode}")).ToList();
    }

    public async Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == orderCode.Trim().ToUpper());

        if (order == null) return null;

        var baseUrl = GetBaseFrontendUrl();
        return MapToResponseDto(order, $"{baseUrl}/?track={order.OrderCode}");
    }

    public async Task<OrderResponseDto> UpdateOrderStatusAsync(string orderCode, string newStatus, string? adminNote)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == orderCode.Trim().ToUpper());

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with code '{orderCode}' not found.");
        }

        var oldStatus = order.Status;
        order.Status = newStatus.Trim();

        if (!string.IsNullOrWhiteSpace(adminNote))
        {
            order.OrderNotes = string.IsNullOrWhiteSpace(order.OrderNotes)
                ? $"[Admin Note]: {adminNote.Trim()}"
                : $"{order.OrderNotes} | [Admin Note]: {adminNote.Trim()}";
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Order {OrderCode} status changed from {OldStatus} to {NewStatus}", orderCode, oldStatus, newStatus);

        var baseUrl = GetBaseFrontendUrl();
        var trackingUrl = $"{baseUrl}/?track={order.OrderCode}";

        // Send status update email notification to customer
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendOrderStatusUpdateEmailAsync(order, trackingUrl, oldStatus, newStatus);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send status update email for order {OrderCode}", order.OrderCode);
            }
        });

        return MapToResponseDto(order, trackingUrl);
    }

    public async Task<List<CustomerSummaryDto>> GetCustomersAsync(string? search)
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var customerGroups = orders
            .GroupBy(o => o.CustomerEmail.Trim().ToLowerInvariant())
            .Select(g =>
            {
                var latestOrder = g.First();
                return new CustomerSummaryDto
                {
                    CustomerEmail = latestOrder.CustomerEmail,
                    CustomerName = latestOrder.CustomerName,
                    CustomerPhone = latestOrder.CustomerPhone,
                    DeliveryAddress = latestOrder.DeliveryAddress,
                    TotalOrders = g.Count(),
                    TotalSpent = g.Sum(o => o.GrandTotal),
                    FirstOrderDate = g.Min(o => o.CreatedAt),
                    LastOrderDate = g.Max(o => o.CreatedAt),
                    LatestOrderStatus = latestOrder.Status
                };
            })
            .OrderByDescending(c => c.TotalSpent)
            .ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            customerGroups = customerGroups.Where(c =>
                c.CustomerName.ToLower().Contains(s) ||
                c.CustomerEmail.ToLower().Contains(s) ||
                c.CustomerPhone.ToLower().Contains(s)).ToList();
        }

        return customerGroups;
    }

    public async Task<List<OrderResponseDto>> GetCustomerOrdersAsync(string customerEmail)
    {
        var normalized = customerEmail.Trim().ToLowerInvariant();
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .AsNoTracking()
            .Where(o => o.CustomerEmail.ToLower() == normalized)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var baseUrl = GetBaseFrontendUrl();
        return orders.Select(o => MapToResponseDto(o, $"{baseUrl}/?track={o.OrderCode}")).ToList();
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var totalOrders = orders.Count;
        var totalRevenue = orders.Sum(o => o.GrandTotal);

        var statusBreakdown = orders
            .GroupBy(o => o.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        int activeTickets = orders.Count(o =>
            o.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
            o.Status.Equals("Confirmed", StringComparison.OrdinalIgnoreCase) ||
            o.Status.Equals("Preparing", StringComparison.OrdinalIgnoreCase) ||
            o.Status.Equals("Out for Delivery", StringComparison.OrdinalIgnoreCase) ||
            o.Status.Equals("OutForDelivery", StringComparison.OrdinalIgnoreCase));

        int deliveredOrders = orders.Count(o => o.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase));
        int pendingOrders = orders.Count(o =>
            o.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
            o.Status.Equals("Confirmed", StringComparison.OrdinalIgnoreCase));

        var baseUrl = GetBaseFrontendUrl();
        var recentOrders = orders.Take(10)
            .Select(o => MapToResponseDto(o, $"{baseUrl}/?track={o.OrderCode}"))
            .ToList();

        return new DashboardStatsDto
        {
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            ActiveTickets = activeTickets,
            DeliveredOrders = deliveredOrders,
            PendingOrders = pendingOrders,
            StatusBreakdown = statusBreakdown,
            RecentOrders = recentOrders
        };
    }

    private string GetBaseFrontendUrl()
    {
        return _configuration["App:FrontendUrl"] ?? "http://localhost:5173";
    }

    private static OrderResponseDto MapToResponseDto(Order order, string trackingUrl = "")
    {
        return new OrderResponseDto
        {
            OrderCode = order.OrderCode,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            DeliveryAddress = order.DeliveryAddress,
            RequestedDeliveryTime = order.RequestedDeliveryTime,
            OrderNotes = order.OrderNotes,
            CreatedAt = order.CreatedAt,
            Status = order.Status,
            Subtotal = order.Subtotal,
            VolumeDiscountSavings = order.VolumeDiscountSavings,
            GrandTotal = order.GrandTotal,
            TrackingUrl = trackingUrl,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                FoodId = oi.FoodItemId,
                FoodName = oi.FoodName,
                Litres = oi.Litres,
                ProteinOptionId = oi.ProteinOptionId,
                ProteinName = oi.ProteinName,
                BaseLitrePrice = oi.BaseLitrePrice,
                DiscountedLitrePrice = oi.DiscountedLitrePrice,
                BaseDishTotal = oi.BaseDishTotal,
                PepperLevel = oi.PepperLevel,
                SpiceLevel = oi.SpiceLevel,
                ItemTotal = oi.ItemTotal,
                Extras = oi.OrderItemExtras.Select(oe => new OrderItemExtraResponseDto
                {
                    ExtraProteinId = oe.ExtraProteinId,
                    ExtraProteinName = oe.ExtraProteinName,
                    UnitPrice = oe.UnitPrice,
                    Quantity = oe.Quantity,
                    Subtotal = oe.Subtotal
                }).ToList()
            }).ToList()
        };
    }
}
