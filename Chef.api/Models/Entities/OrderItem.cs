namespace Chef.api.Models.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public string FoodItemId { get; set; } = string.Empty;
    public FoodItem? FoodItem { get; set; }
    public string FoodName { get; set; } = string.Empty;

    public int Litres { get; set; }

    public string ProteinOptionId { get; set; } = string.Empty;
    public ProteinOption? ProteinOption { get; set; }
    public string ProteinName { get; set; } = string.Empty;

    public decimal BaseLitrePrice { get; set; }
    public decimal DiscountedLitrePrice { get; set; }
    public decimal BaseDishTotal { get; set; }

    public string PepperLevel { get; set; } = "Medium";
    public string SpiceLevel { get; set; } = "Standard";

    public decimal ItemTotal { get; set; }

    public ICollection<OrderItemExtra> OrderItemExtras { get; set; } = new List<OrderItemExtra>();
}
