namespace Chef.api.Models.Entities;

public class ProteinOption
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ICollection<FoodProteinPrice> FoodProteinPrices { get; set; } = new List<FoodProteinPrice>();
}
