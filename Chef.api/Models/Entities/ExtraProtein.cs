namespace Chef.api.Models.Entities;

public class ExtraProtein
{
    public string Id { get; set; } = string.Empty;
    public string FoodItemId { get; set; } = string.Empty;
    public FoodItem? FoodItem { get; set; }

    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
