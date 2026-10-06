using Microsoft.EntityFrameworkCore;
using Chef.api.Models.Entities;

namespace Chef.api.Data;

public class ChefDbContext : DbContext
{
    public ChefDbContext(DbContextOptions<ChefDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<FoodItem> FoodItems => Set<FoodItem>();
    public DbSet<ProteinOption> ProteinOptions => Set<ProteinOption>();
    public DbSet<FoodProteinPrice> FoodProteinPrices => Set<FoodProteinPrice>();
    public DbSet<ExtraProtein> ExtraProteins => Set<ExtraProtein>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemExtra> OrderItemExtras => Set<OrderItemExtra>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasMaxLength(50);
            entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
        });

        // FoodItem
        modelBuilder.Entity<FoodItem>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Id).HasMaxLength(50);
            entity.Property(f => f.Name).HasMaxLength(150).IsRequired();
            entity.Property(f => f.CategoryId).HasMaxLength(50).IsRequired();
            entity.Property(f => f.Description).HasMaxLength(1000);
            entity.Property(f => f.Image).HasMaxLength(500);

            entity.HasOne(f => f.Category)
                .WithMany(c => c.FoodItems)
                .HasForeignKey(f => f.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProteinOption
        modelBuilder.Entity<ProteinOption>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasMaxLength(50);
            entity.Property(p => p.Name).HasMaxLength(150).IsRequired();
        });

        // FoodProteinPrice
        modelBuilder.Entity<FoodProteinPrice>(entity =>
        {
            entity.HasKey(fp => fp.Id);
            entity.Property(fp => fp.FoodItemId).HasMaxLength(50).IsRequired();
            entity.Property(fp => fp.ProteinOptionId).HasMaxLength(50).IsRequired();
            entity.Property(fp => fp.PricePerLitre).HasPrecision(18, 2);

            entity.HasOne(fp => fp.FoodItem)
                .WithMany(f => f.ProteinPrices)
                .HasForeignKey(fp => fp.FoodItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(fp => fp.ProteinOption)
                .WithMany(p => p.FoodProteinPrices)
                .HasForeignKey(fp => fp.ProteinOptionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(fp => new { fp.FoodItemId, fp.ProteinOptionId }).IsUnique();
        });

        // ExtraProtein
        modelBuilder.Entity<ExtraProtein>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.FoodItemId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Price).HasPrecision(18, 2);

            entity.HasOne(e => e.FoodItem)
                .WithMany(f => f.ExtraProteins)
                .HasForeignKey(e => e.FoodItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.OrderCode).HasMaxLength(30).IsRequired();
            entity.HasIndex(o => o.OrderCode).IsUnique();

            entity.Property(o => o.CustomerName).HasMaxLength(150).IsRequired();
            entity.Property(o => o.CustomerPhone).HasMaxLength(50).IsRequired();
            entity.Property(o => o.CustomerEmail).HasMaxLength(150).IsRequired();
            entity.Property(o => o.DeliveryAddress).HasMaxLength(500).IsRequired();
            entity.Property(o => o.OrderNotes).HasMaxLength(1000);
            entity.Property(o => o.Status).HasMaxLength(50).IsRequired();

            entity.Property(o => o.Subtotal).HasPrecision(18, 2);
            entity.Property(o => o.VolumeDiscountSavings).HasPrecision(18, 2);
            entity.Property(o => o.GrandTotal).HasPrecision(18, 2);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.FoodItemId).HasMaxLength(50).IsRequired();
            entity.Property(oi => oi.FoodName).HasMaxLength(150).IsRequired();
            entity.Property(oi => oi.ProteinOptionId).HasMaxLength(50).IsRequired();
            entity.Property(oi => oi.ProteinName).HasMaxLength(150).IsRequired();
            entity.Property(oi => oi.PepperLevel).HasMaxLength(50).IsRequired();
            entity.Property(oi => oi.SpiceLevel).HasMaxLength(50).IsRequired();

            entity.Property(oi => oi.BaseLitrePrice).HasPrecision(18, 2);
            entity.Property(oi => oi.DiscountedLitrePrice).HasPrecision(18, 2);
            entity.Property(oi => oi.BaseDishTotal).HasPrecision(18, 2);
            entity.Property(oi => oi.ItemTotal).HasPrecision(18, 2);

            entity.HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oi => oi.FoodItem)
                .WithMany()
                .HasForeignKey(oi => oi.FoodItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(oi => oi.ProteinOption)
                .WithMany()
                .HasForeignKey(oi => oi.ProteinOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItemExtra
        modelBuilder.Entity<OrderItemExtra>(entity =>
        {
            entity.HasKey(oe => oe.Id);
            entity.Property(oe => oe.ExtraProteinId).HasMaxLength(50).IsRequired();
            entity.Property(oe => oe.ExtraProteinName).HasMaxLength(150).IsRequired();
            entity.Property(oe => oe.UnitPrice).HasPrecision(18, 2);
            entity.Property(oe => oe.Subtotal).HasPrecision(18, 2);

            entity.HasOne(oe => oe.OrderItem)
                .WithMany(oi => oi.OrderItemExtras)
                .HasForeignKey(oe => oe.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oe => oe.ExtraProtein)
                .WithMany()
                .HasForeignKey(oe => oe.ExtraProteinId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Unified User Entity (User & Admin accounts)
        modelBuilder.Ignore<AdminUser>();
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).HasMaxLength(100).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.PasswordSalt).HasMaxLength(255).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            entity.Property(u => u.PhoneNumber).HasMaxLength(50);
            entity.Property(u => u.Role).HasMaxLength(50).IsRequired();
            entity.Property(u => u.TwoFactorSecret).HasMaxLength(255);
        });
    }
}
