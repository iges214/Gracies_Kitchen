namespace Chef.api.Models.Entities;

/// <summary>
/// Legacy reference retained for backward compatibility. Inherits from unified User entity.
/// </summary>
public class AdminUser : User
{
    public AdminUser()
    {
        Role = "Admin";
    }
}
