using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Chef.api.Models.DTOs;
using Chef.api.Services;

namespace Chef.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminOrderService _adminOrderService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminOrderService adminOrderService, ILogger<AdminController> logger)
    {
        _adminOrderService = adminOrderService;
        _logger = logger;
    }

    /// <summary>
    /// Admin login endpoint. Authenticates credentials and verifies server-side Admin role.
    /// Non-admin accounts are rejected server-side.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AdminAuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] AdminLoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _adminOrderService.AuthenticateAdminAsync(dto.EmailOrUsername, dto.Password);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email/username or password." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Returns the authenticated admin user's identity details.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetCurrentAdmin()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var fullName = User.FindFirstValue("FullName") ?? string.Empty;
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";

        return Ok(new
        {
            email,
            fullName,
            role
        });
    }

    /// <summary>
    /// Returns KPI statistics, status breakdown, and recent orders for the admin dashboard.
    /// </summary>
    [HttpGet("dashboard-stats")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var stats = await _adminOrderService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard statistics.");
            return StatusCode(500, new { message = "Failed to load dashboard statistics." });
        }
    }

    /// <summary>
    /// Retrieves all orders/tickets with optional status filtering and search query.
    /// </summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<OrderResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var orders = await _adminOrderService.GetOrdersAsync(status, search, page, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders list.");
            return StatusCode(500, new { message = "Failed to load orders." });
        }
    }

    /// <summary>
    /// Retrieves full order details for a specific order code.
    /// </summary>
    [HttpGet("orders/{orderCode}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderByCode(string orderCode)
    {
        var order = await _adminOrderService.GetOrderByCodeAsync(orderCode);
        if (order == null)
        {
            return NotFound(new { message = $"Order '{orderCode}' not found." });
        }

        return Ok(order);
    }

    /// <summary>
    /// Updates the status of an order/ticket (e.g. Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled) and sends customer notification.
    /// </summary>
    [HttpPut("orders/{orderCode}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderStatus(string orderCode, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updatedOrder = await _adminOrderService.UpdateOrderStatusAsync(orderCode, dto.Status, dto.AdminNote);
            return Ok(updatedOrder);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for order {OrderCode}", orderCode);
            return StatusCode(500, new { message = "Failed to update order status." });
        }
    }

    /// <summary>
    /// Retrieves a aggregated list of all customers, contact info, total orders placed, and lifetime spend.
    /// </summary>
    [HttpGet("customers")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<CustomerSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomers([FromQuery] string? search)
    {
        try
        {
            var customers = await _adminOrderService.GetCustomersAsync(search);
            return Ok(customers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customers list.");
            return StatusCode(500, new { message = "Failed to load customers." });
        }
    }

    /// <summary>
    /// Retrieves full order history for a specific customer email address.
    /// </summary>
    [HttpGet("customers/{email}/orders")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<OrderResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomerOrders(string email)
    {
        try
        {
            var orders = await _adminOrderService.GetCustomerOrdersAsync(email);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order history for customer {Email}", email);
            return StatusCode(500, new { message = "Failed to load customer order history." });
        }
    }
}
