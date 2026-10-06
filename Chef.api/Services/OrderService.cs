using Microsoft.EntityFrameworkCore;
using Chef.api.Data;
using Chef.api.Models.DTOs;
using Chef.api.Models.Entities;

namespace Chef.api.Services;

public class OrderService : IOrderService
{
    private readonly ChefDbContext _context;
    private readonly ILogger<OrderService> _logger;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public OrderService(
        ChefDbContext context, 
        ILogger<OrderService> logger,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto dto)
    {
        // 1. Validate Lead Time (minimum 2 hours in advance)
        var nowUtc = DateTime.UtcNow;
        var leadTimeDifference = dto.RequestedDeliveryTime.ToUniversalTime() - nowUtc;
        if (leadTimeDifference.TotalHours < 1.95) // Allow small clock skew tolerance ~2hrs
        {
            throw new BadHttpRequestException("Minimum lead time is 2 hours. Gracie's Kitchen prepares each dish fresh to order.");
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new BadHttpRequestException("Your order must contain at least one dish.");
        }

        // 2. Pre-fetch FoodItems, ProteinPrices, and Extras in one go for fast, secure lookup
        var foodIds = dto.Items.Select(i => i.FoodId).Distinct().ToList();
        var foods = await _context.FoodItems
            .Include(f => f.ProteinPrices)
                .ThenInclude(pp => pp.ProteinOption)
            .Include(f => f.ExtraProteins)
            .Where(f => foodIds.Contains(f.Id) && f.IsActive)
            .ToDictionaryAsync(f => f.Id, f => f);

        decimal orderSubtotal = 0m;
        decimal orderSavings = 0m;
        decimal orderGrandTotal = 0m;

        var orderItems = new List<OrderItem>();

        foreach (var itemDto in dto.Items)
        {
            if (!foods.TryGetValue(itemDto.FoodId, out var food))
            {
                throw new BadHttpRequestException($"Invalid or unavailable dish: {itemDto.FoodId}");
            }

            if (itemDto.Litres < food.MinLitres || itemDto.Litres > food.MaxLitres)
            {
                throw new BadHttpRequestException(
                    $"Dish '{food.Name}' must be ordered between {food.MinLitres}L and {food.MaxLitres}L. Requested: {itemDto.Litres}L.");
            }

            // Find authoritative protein price for this dish
            var proteinPriceRecord = food.ProteinPrices
                .FirstOrDefault(pp => pp.ProteinOptionId == itemDto.ProteinOptionId);

            if (proteinPriceRecord == null || proteinPriceRecord.ProteinOption == null)
            {
                throw new BadHttpRequestException(
                    $"Selected protein option is not valid for dish '{food.Name}'.");
            }

            decimal baseLitrePrice = proteinPriceRecord.PricePerLitre;
            decimal discountedLitrePrice = Math.Round(baseLitrePrice * 0.90m, 2);

            // Volume Discount: 1st litre is full price; each additional litre is 10% off
            int additionalLitres = itemDto.Litres > 1 ? itemDto.Litres - 1 : 0;
            decimal baseDishTotal = itemDto.Litres == 1
                ? baseLitrePrice
                : baseLitrePrice + (additionalLitres * discountedLitrePrice);

            decimal undiscountedDishTotal = itemDto.Litres * baseLitrePrice;
            decimal dishVolumeSavings = undiscountedDishTotal - baseDishTotal;

            // Process Extra Proteins
            decimal extrasTotal = 0m;
            var orderItemExtras = new List<OrderItemExtra>();

            if (itemDto.Extras != null && itemDto.Extras.Count > 0)
            {
                foreach (var extraDto in itemDto.Extras)
                {
                    if (extraDto.Quantity <= 0) continue;

                    var extraDefinition = food.ExtraProteins
                        .FirstOrDefault(ep => ep.Id == extraDto.ExtraId);

                    if (extraDefinition == null)
                    {
                        throw new BadHttpRequestException(
                            $"Extra add-on '{extraDto.ExtraId}' is not valid for dish '{food.Name}'.");
                    }

                    decimal extraSubtotal = extraDefinition.Price * extraDto.Quantity;
                    extrasTotal += extraSubtotal;

                    orderItemExtras.Add(new OrderItemExtra
                    {
                        ExtraProteinId = extraDefinition.Id,
                        ExtraProteinName = extraDefinition.Name,
                        UnitPrice = extraDefinition.Price,
                        Quantity = extraDto.Quantity,
                        Subtotal = extraSubtotal
                    });
                }
            }

            decimal itemGrandTotal = baseDishTotal + extrasTotal;
            decimal itemUndiscountedTotal = undiscountedDishTotal + extrasTotal;

            orderSubtotal += itemUndiscountedTotal;
            orderSavings += dishVolumeSavings;
            orderGrandTotal += itemGrandTotal;

            orderItems.Add(new OrderItem
            {
                FoodItemId = food.Id,
                FoodName = food.Name,
                Litres = itemDto.Litres,
                ProteinOptionId = proteinPriceRecord.ProteinOptionId,
                ProteinName = proteinPriceRecord.ProteinOption.Name,
                BaseLitrePrice = baseLitrePrice,
                DiscountedLitrePrice = discountedLitrePrice,
                BaseDishTotal = baseDishTotal,
                PepperLevel = string.IsNullOrWhiteSpace(itemDto.PepperLevel) ? "Medium" : itemDto.PepperLevel,
                SpiceLevel = string.IsNullOrWhiteSpace(itemDto.SpiceLevel) ? "Standard" : itemDto.SpiceLevel,
                ItemTotal = itemGrandTotal,
                OrderItemExtras = orderItemExtras
            });
        }

        // 3. Generate Unique Order Code (e.g. GK-1042)
        string orderCode = await GenerateUniqueOrderCodeAsync();

        var order = new Order
        {
            OrderCode = orderCode,
            CustomerName = dto.CustomerName.Trim(),
            CustomerPhone = dto.CustomerPhone.Trim(),
            CustomerEmail = dto.CustomerEmail.Trim(),
            DeliveryAddress = dto.DeliveryAddress.Trim(),
            RequestedDeliveryTime = dto.RequestedDeliveryTime,
            OrderNotes = dto.OrderNotes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            Status = "Confirmed",
            Subtotal = orderSubtotal,
            VolumeDiscountSavings = orderSavings,
            GrandTotal = orderGrandTotal,
            OrderItems = orderItems
        };

        // 4. Save Order in Single Transaction
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Order {OrderCode} created successfully for {CustomerName}. Total: {Total:C}",
                order.OrderCode, order.CustomerName, order.GrandTotal);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to save order transaction for {CustomerName}", dto.CustomerName);
            throw;
        }

        var baseUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";
        var trackingUrl = $"{baseUrl}/?track={order.OrderCode}";

        // Send confirmation email with live tracking ticket link
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendOrderTicketEmailAsync(order, trackingUrl);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background email ticket dispatch failed for order {OrderCode}", order.OrderCode);
            }
        });

        return MapToResponseDto(order, trackingUrl);
    }

    public async Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemExtras)
            .FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == orderCode.Trim().ToUpper());

        if (order == null) return null;

        var baseUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";
        var trackingUrl = $"{baseUrl}/?track={order.OrderCode}";

        return MapToResponseDto(order, trackingUrl);
    }

    private async Task<string> GenerateUniqueOrderCodeAsync()
    {
        for (int i = 0; i < 10; i++)
        {
            int codeNumber = Random.Shared.Next(1000, 9999);
            string code = $"GK-{codeNumber}";
            bool exists = await _context.Orders.AnyAsync(o => o.OrderCode == code);
            if (!exists)
            {
                return code;
            }
        }

        // Fallback with timestamp digits
        return $"GK-{DateTime.UtcNow:MMddHHmm}";
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
