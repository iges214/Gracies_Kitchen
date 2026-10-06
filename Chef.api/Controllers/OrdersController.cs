using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Chef.api.Models.DTOs;
using Chef.api.Services;

namespace Chef.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Submits a new customer food order. Validates dishes, proteins, and calculates server-side authoritative pricing.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var createdOrder = await _orderService.CreateOrderAsync(dto);
            return CreatedAtAction(nameof(GetOrderByCode), new { orderCode = createdOrder.OrderCode }, createdOrder);
        }
        catch (BadHttpRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while processing order.");
            return StatusCode(500, new { message = "An error occurred while placing your order. Please try again." });
        }
    }

    /// <summary>
    /// Retrieves order details and status by unique order code (e.g. GK-1042).
    /// </summary>
    [HttpGet("{orderCode}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderByCode(string orderCode)
    {
        var order = await _orderService.GetOrderByCodeAsync(orderCode);
        if (order == null)
        {
            return NotFound(new { message = $"Order with reference '{orderCode}' was not found." });
        }

        return Ok(order);
    }

    /// <summary>
    /// Retrieves order history for the currently authenticated customer.
    /// Accessible by any authenticated User.
    /// </summary>
    [HttpGet("my-orders")]
    [Authorize]
    [ProducesResponseType(typeof(List<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyOrders([FromServices] IAdminOrderService adminOrderService)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new { message = "User email not found in identity claims." });
        }

        var orders = await adminOrderService.GetCustomerOrdersAsync(email);
        return Ok(orders);
    }
}
