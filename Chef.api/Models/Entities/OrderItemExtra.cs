namespace Chef.api.Models.Entities;

public class OrderItemExtra
{
    public int Id { get; set; }
    public int OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }

    public string ExtraProteinId { get; set; } = string.Empty;
    public ExtraProtein? ExtraProtein { get; set; }
    public string ExtraProteinName { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
