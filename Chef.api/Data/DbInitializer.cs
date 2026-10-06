using Microsoft.EntityFrameworkCore;
using Chef.api.Models.Entities;

namespace Chef.api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(
        ChefDbContext context, 
        Services.IPasswordHasher? passwordHasher = null,
        IConfiguration? configuration = null,
        IHostEnvironment? environment = null)
    {
        // 1. Seed Initial Admin User (Safe Development Mechanism)
        bool hasAdmin = await context.Users.AnyAsync(u => u.Role == "Admin");
        if (!hasAdmin)
        {
            bool isDev = environment?.IsDevelopment() ?? true;
            string? configuredPassword = configuration?["InitialAdmin:Password"] 
                ?? configuration?["ADMIN_PASSWORD"];

            // Only seed initial admin if explicitly configured via User Secrets or environment variable
            if (string.IsNullOrWhiteSpace(configuredPassword))
            {
                // In both dev and prod, do not seed default admin with a hardcoded password.
                // Developers should configure via: dotnet user-secrets set "InitialAdmin:Password" "..."
            }
            else
            {
                var adminPassword = configuredPassword;
                var adminEmail = configuration?["InitialAdmin:Email"] ?? "admin@gracieskitchen.com";
                var adminUsername = configuration?["InitialAdmin:Username"] ?? "admin";
                var adminFullName = configuration?["InitialAdmin:FullName"] ?? "Chef Gracie Admin";

                var hasher = passwordHasher ?? new Services.PasswordHasher();
                var (hash, salt) = hasher.HashPassword(adminPassword);

                await context.Users.AddAsync(new User
                {
                    Username = adminUsername,
                    Email = adminEmail,
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    FullName = adminFullName,
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    AccessFailedCount = 0,
                    LockoutEnd = null
                });
                await context.SaveChangesAsync();
            }
        }

        if (await context.Categories.AnyAsync())
        {
            return; // Menu has already been seeded
        }

        // 1. Categories
        var categories = new List<Category>
        {
            new() { Id = "soups", Name = "Signature Soups", DisplayOrder = 1 },
            new() { Id = "rice", Name = "Rice Specialties", DisplayOrder = 2 },
            new() { Id = "stews", Name = "Rich Stews & Sauces", DisplayOrder = 3 }
        };
        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        // 2. Protein Options
        var proteins = new List<ProteinOption>
        {
            new() { Id = "beef", Name = "Assorted Beef & Shaki" },
            new() { Id = "goat", Name = "Tender Goat Meat" },
            new() { Id = "chicken", Name = "Hard Local Chicken" },
            new() { Id = "catfish", Name = "Smoked Catfish & Stockfish" },
            new() { Id = "none", Name = "Vegetarian / No Meat" },
            new() { Id = "jollof-chicken", Name = "Peppered Grilled Chicken" },
            new() { Id = "jollof-beef", Name = "Fried Assorted Beef" },
            new() { Id = "turkey", Name = "Crispy Peppered Turkey" },
            new() { Id = "jollof-goat", Name = "Asun Style Goat Meat" },
            new() { Id = "rice-only", Name = "Rice Only (No Meat)" },
            new() { Id = "seafood-deluxe", Name = "Deluxe Mixed Seafood (Prawns, Crab, Calamari)" },
            new() { Id = "fish-prawn", Name = "Fresh Croaker Fish & Jumbo Prawns" },
            new() { Id = "assorted-offal", Name = "Traditional Assorted Meats & Boiled Eggs" },
            new() { Id = "boneless-beef", Name = "Boneless Beef & Smoked Fish" }
        };
        await context.ProteinOptions.AddRangeAsync(proteins);
        await context.SaveChangesAsync();

        // 3. Food Items
        var foods = new List<FoodItem>
        {
            new()
            {
                Id = "egusi-soup",
                Name = "Royal Egusi Soup",
                CategoryId = "soups",
                Description = "Slow-cooked hand-peeled melon seeds, tender leafy greens, smoked crayfish, and authentic palm oil reduction.",
                Image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                MinLitres = 1,
                MaxLitres = 10,
                IsActive = true
            },
            new()
            {
                Id = "jollof-rice",
                Name = "Smoky Firewood Jollof Rice",
                CategoryId = "rice",
                Description = "Signature party-style parboiled long-grain rice infused with red bell pepper reduction, plum tomatoes, and natural smoke.",
                Image = "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
                MinLitres = 1,
                MaxLitres = 10,
                IsActive = true
            },
            new()
            {
                Id = "seafood-okro",
                Name = "Artisan Seafood Okro",
                CategoryId = "soups",
                Description = "Fresh crunchy diced okra in light seafood broth loaded with jumbo prawns, crabs, calamari, and fresh herbs.",
                Image = "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
                MinLitres = 1,
                MaxLitres = 5,
                IsActive = true
            },
            new()
            {
                Id = "ofada-sauce",
                Name = "Ayamase (Designer Ofada Stew)",
                CategoryId = "stews",
                Description = "Bleached palm oil, green bell peppers, locust beans (iru), boiled eggs, and assorted bite-sized meats simmered to perfection.",
                Image = "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
                MinLitres = 1,
                MaxLitres = 5,
                IsActive = true
            }
        };
        await context.FoodItems.AddRangeAsync(foods);
        await context.SaveChangesAsync();

        // 4. Food Protein Prices
        var foodProteinPrices = new List<FoodProteinPrice>
        {
            // Egusi Soup
            new() { FoodItemId = "egusi-soup", ProteinOptionId = "beef", PricePerLitre = 12000m },
            new() { FoodItemId = "egusi-soup", ProteinOptionId = "goat", PricePerLitre = 14500m },
            new() { FoodItemId = "egusi-soup", ProteinOptionId = "chicken", PricePerLitre = 11000m },
            new() { FoodItemId = "egusi-soup", ProteinOptionId = "catfish", PricePerLitre = 15000m },
            new() { FoodItemId = "egusi-soup", ProteinOptionId = "none", PricePerLitre = 9000m },

            // Jollof Rice
            new() { FoodItemId = "jollof-rice", ProteinOptionId = "jollof-chicken", PricePerLitre = 9500m },
            new() { FoodItemId = "jollof-rice", ProteinOptionId = "jollof-beef", PricePerLitre = 10500m },
            new() { FoodItemId = "jollof-rice", ProteinOptionId = "turkey", PricePerLitre = 13000m },
            new() { FoodItemId = "jollof-rice", ProteinOptionId = "jollof-goat", PricePerLitre = 13500m },
            new() { FoodItemId = "jollof-rice", ProteinOptionId = "rice-only", PricePerLitre = 7500m },

            // Seafood Okro
            new() { FoodItemId = "seafood-okro", ProteinOptionId = "seafood-deluxe", PricePerLitre = 18000m },
            new() { FoodItemId = "seafood-okro", ProteinOptionId = "fish-prawn", PricePerLitre = 16500m },

            // Ayamase Ofada
            new() { FoodItemId = "ofada-sauce", ProteinOptionId = "assorted-offal", PricePerLitre = 14000m },
            new() { FoodItemId = "ofada-sauce", ProteinOptionId = "boneless-beef", PricePerLitre = 15500m }
        };
        await context.FoodProteinPrices.AddRangeAsync(foodProteinPrices);
        await context.SaveChangesAsync();

        // 5. Extra Proteins
        var extraProteins = new List<ExtraProtein>
        {
            // Egusi
            new() { Id = "extra-goat", FoodItemId = "egusi-soup", Name = "Extra Goat Meat (Portion)", Price = 2500m },
            new() { Id = "extra-catfish", FoodItemId = "egusi-soup", Name = "Extra Smoked Catfish (Piece)", Price = 3000m },
            new() { Id = "extra-beef", FoodItemId = "egusi-soup", Name = "Extra Assorted Beef (Portion)", Price = 2000m },

            // Jollof
            new() { Id = "extra-turkey", FoodItemId = "jollof-rice", Name = "Extra Peppered Turkey", Price = 3500m },
            new() { Id = "extra-chicken", FoodItemId = "jollof-rice", Name = "Extra Grilled Chicken", Price = 2200m },
            new() { Id = "extra-jollof-beef", FoodItemId = "jollof-rice", Name = "Extra Beef Portion", Price = 2000m },

            // Seafood Okro
            new() { Id = "extra-prawns", FoodItemId = "seafood-okro", Name = "Extra Grilled Jumbo Prawns (Pair)", Price = 4000m },
            new() { Id = "extra-crab", FoodItemId = "seafood-okro", Name = "Extra Dressed Blue Crab", Price = 3500m },

            // Ayamase
            new() { Id = "extra-eggs", FoodItemId = "ofada-sauce", Name = "Extra Stewed Eggs (Pair)", Price = 1000m },
            new() { Id = "extra-assorted", FoodItemId = "ofada-sauce", Name = "Extra Assorted Meat Portion", Price = 2500m }
        };
        await context.ExtraProteins.AddRangeAsync(extraProteins);
        await context.SaveChangesAsync();
    }
}
