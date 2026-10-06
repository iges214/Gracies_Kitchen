using Chef.api.Models.Entities;

namespace Chef.api.Services;

public interface IEmailService
{
    Task SendOrderTicketEmailAsync(Order order, string trackingUrl);
    Task SendOrderStatusUpdateEmailAsync(Order order, string trackingUrl, string oldStatus, string newStatus);
}
