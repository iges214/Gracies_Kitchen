namespace Chef.api.Models.DTOs;

public class FoodItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int MinLitres { get; set; }
    public int MaxLitres { get; set; }
    public List<ProteinOptionDto> ProteinOptions { get; set; } = new();
    public List<ExtraProteinDto> ExtraProteins { get; set; } = new();
}
