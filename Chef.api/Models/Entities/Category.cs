namespace Chef.api.Models.Entities;

public class Category
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public ICollection<FoodItem> FoodItems { get; set; } = new List<FoodItem>();
}
