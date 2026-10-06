using Chef.api.Models.Entities;

namespace Chef.api.Services;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
