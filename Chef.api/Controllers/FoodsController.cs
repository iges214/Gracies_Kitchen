using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chef.api.Data;
using Chef.api.Models.DTOs;

namespace Chef.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodsController : ControllerBase
{
    private readonly ChefDbContext _context;

    public FoodsController(ChefDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FoodItemDto>>> GetFoods()
    {
        var foods = await _context.FoodItems
            .Where(f => f.IsActive)
            .Include(f => f.Category)
            .Include(f => f.ProteinPrices)
                .ThenInclude(pp => pp.ProteinOption)
            .Include(f => f.ExtraProteins)
            .OrderBy(f => f.Category != null ? f.Category.DisplayOrder : 99)
            .ThenBy(f => f.Name)
            .ToListAsync();

        var result = foods.Select(f => new FoodItemDto
        {
            Id = f.Id,
            Name = f.Name,
            Category = f.CategoryId,
            Description = f.Description,
            Image = f.Image,
            MinLitres = f.MinLitres,
            MaxLitres = f.MaxLitres,
            ProteinOptions = f.ProteinPrices.Select(pp => new ProteinOptionDto
            {
                Id = pp.ProteinOptionId,
                Name = pp.ProteinOption?.Name ?? pp.ProteinOptionId,
                PricePerLitre = pp.PricePerLitre
            }).ToList(),
            ExtraProteins = f.ExtraProteins.Select(ep => new ExtraProteinDto
            {
                Id = ep.Id,
                Name = ep.Name,
                Price = ep.Price
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Returns a single food item with all protein options and extras.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<FoodItemDto>> GetFoodById(string id)
    {
        var f = await _context.FoodItems
            .Include(f => f.Category)
            .Include(f => f.ProteinPrices)
                .ThenInclude(pp => pp.ProteinOption)
            .Include(f => f.ExtraProteins)
            .FirstOrDefaultAsync(f => f.Id.ToLower() == id.ToLower() && f.IsActive);

        if (f == null)
        {
            return NotFound(new { message = $"Dish with ID '{id}' was not found." });
        }

        var result = new FoodItemDto
        {
            Id = f.Id,
            Name = f.Name,
            Category = f.CategoryId,
            Description = f.Description,
            Image = f.Image,
            MinLitres = f.MinLitres,
            MaxLitres = f.MaxLitres,
            ProteinOptions = f.ProteinPrices.Select(pp => new ProteinOptionDto
            {
                Id = pp.ProteinOptionId,
                Name = pp.ProteinOption?.Name ?? pp.ProteinOptionId,
                PricePerLitre = pp.PricePerLitre
            }).ToList(),
            ExtraProteins = f.ExtraProteins.Select(ep => new ExtraProteinDto
            {
                Id = ep.Id,
                Name = ep.Name,
                Price = ep.Price
            }).ToList()
        };

        return Ok(result);
    }

    /// <summary>
    /// Returns all menu categories.
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                DisplayOrder = c.DisplayOrder
            })
            .ToListAsync();

        return Ok(categories);
    }
}
