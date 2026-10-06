namespace Chef.api.Models.DTOs;

public class CategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}