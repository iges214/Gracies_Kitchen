using Microsoft.AspNetCore.Mvc;

namespace Chef.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetStatus()
    {
        return Ok(new
        {
            status = "Healthy",
            message = "Private Chef API is running successfully!",
            timestamp = DateTime.UtcNow
        });
    }
}
