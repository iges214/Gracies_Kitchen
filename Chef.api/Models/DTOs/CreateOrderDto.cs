using System.ComponentModel.DataAnnotations;

namespace Chef.api.Models.DTOs;

public class CreateOrderDto
{
    [Required(ErrorMessage = "Customer name is required.")]
    [StringLength(100, MinimumLength = 2)]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required.")]
    [Phone(ErrorMessage = "Please provide a valid phone number.")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    public string CustomerEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Delivery address is required.")]
    [StringLength(300, MinimumLength = 5)]
    public string DeliveryAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Requested delivery time is required.")]
    public DateTime RequestedDeliveryTime { get; set; }

    [StringLength(500)]
    public string? OrderNotes { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one dish must be in the order.")]
    public List<OrderItemRequestDto> Items { get; set; } = new();
}