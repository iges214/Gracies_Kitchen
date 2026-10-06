namespace Chef.api.Models.Entities;

public class FoodItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public Category? Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int MinLitres { get; set; } = 1;
    public int MaxLitres { get; set; } = 10;
    public bool IsActive { get; set; } = true;

    public ICollection<FoodProteinPrice> ProteinPrices { get; set; } = new List<FoodProteinPrice>();
    public ICollection<ExtraProtein> ExtraProteins { get; set; } = new List<ExtraProtein>();
}
