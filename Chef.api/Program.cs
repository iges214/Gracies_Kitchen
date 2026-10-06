using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Chef.api.Data;
using Chef.api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is not configured. Configure it in appsettings.json, User Secrets (dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\"), or environment variable 'ConnectionStrings__DefaultConnection'.");
}

builder.Services.AddDbContext<ChefDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Application Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAdminOrderService, AdminOrderService>();

// Rate Limiting for Authentication endpoints
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.PermitLimit = 15;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// 3. JWT Authentication & Authorization
var jwtSecretKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtSecretKey))
{
    throw new InvalidOperationException(
        "JWT signing key ('Jwt:Key') is not configured. For local development, configure it using .NET User Secrets:\n" +
        "  dotnet user-secrets set \"Jwt:Key\" \"<your-256-bit-secret-key>\" --project Chef.api\n" +
        "In production, set the environment variable 'Jwt__Key'.");
}
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "GraciesKitchenApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "GraciesKitchenClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };

    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Unauthorized: Authentication token is missing or invalid."
            }));
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Forbidden: Insufficient privileges. Administrator access required."
            }));
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// 4. CORS Configuration for Frontend (Vite on http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Controllers & JSON Formatting (camelCase, string enums)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 6. Swagger / OpenAPI Documentation with JWT Bearer Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Gracies Kitchen API",
        Version = "v1",
        Description = "API for Gracies Kitchen Private Chef Food Ordering Platform with Authoritative Litre-Based Pricing, Ticket Tracking, and Admin Dashboard."
    });

    // JWT Security Scheme in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Automatic Database Migration & Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ChefDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        
        logger.LogInformation("Applying EF Core Migrations for Gracie's Kitchen Database...");
        await context.Database.MigrateAsync();
        logger.LogInformation("EF Core Migrations applied successfully.");

        logger.LogInformation("Seeding Gracie's Kitchen Database (Menu & Admin)...");
        await DbInitializer.SeedAsync(context, passwordHasher, builder.Configuration, app.Environment);
        logger.LogInformation("Database seeded and verified successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing or seeding the database.");
    }
}

// 8. Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gracies Kitchen API v1");
    });
}
else
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("AllowFrontendClient");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
