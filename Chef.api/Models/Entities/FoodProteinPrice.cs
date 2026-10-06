namespace Chef.api.Models.Entities;

public class FoodProteinPrice
{
    public int Id { get; set; }
    public string FoodItemId { get; set; } = string.Empty;
    public FoodItem? FoodItem { get; set; }

    public string ProteinOptionId { get; set; } = string.Empty;
    public ProteinOption? ProteinOption { get; set; }

    public decimal PricePerLitre { get; set; }
}
