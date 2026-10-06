using System.Net;
using System.Net.Mail;
using System.Text;
using Chef.api.Models.Entities;

namespace Chef.api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _emailDumpDirectory;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IWebHostEnvironment env)
    {
        _configuration = configuration;
        _logger = logger;
        _emailDumpDirectory = Path.Combine(env.ContentRootPath, "logs", "emails");

        try
        {
            if (!Directory.Exists(_emailDumpDirectory))
            {
                Directory.CreateDirectory(_emailDumpDirectory);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not create email dump directory at {Path}", _emailDumpDirectory);
        }
    }

    public async Task SendOrderTicketEmailAsync(Order order, string trackingUrl)
    {
        var subject = $"[Ticket #{order.OrderCode}] Your Gracie's Kitchen Order is Confirmed!";
        var htmlBody = BuildOrderTicketHtml(order, trackingUrl);

        await DispatchEmailAsync(order.CustomerEmail, order.CustomerName, subject, htmlBody, order.OrderCode, "NewOrderTicket");
    }

    public async Task SendOrderStatusUpdateEmailAsync(Order order, string trackingUrl, string oldStatus, string newStatus)
    {
        var subject = $"[Ticket #{order.OrderCode}] Order Status Updated: {newStatus}";
        var htmlBody = BuildStatusUpdateHtml(order, trackingUrl, oldStatus, newStatus);

        await DispatchEmailAsync(order.CustomerEmail, order.CustomerName, subject, htmlBody, order.OrderCode, $"StatusUpdate_{newStatus}");
    }

    private async Task DispatchEmailAsync(string recipientEmail, string recipientName, string subject, string htmlBody, string orderCode, string actionType)
    {
        // 1. Always write HTML file dump to disk for development inspection & reliability
        try
        {
            if (Directory.Exists(_emailDumpDirectory))
            {
                var safeFileName = $"email_{orderCode}_{actionType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.html";
                var filePath = Path.Combine(_emailDumpDirectory, safeFileName);
                await File.WriteAllTextAsync(filePath, htmlBody, Encoding.UTF8);
                _logger.LogInformation("📧 Email dump saved to disk: file:///{FilePath}", filePath.Replace("\\", "/"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write email file to disk for order {OrderCode}", orderCode);
        }

        // 2. Log high-visibility tracking link in console
        _logger.LogInformation("===============================================================================");
        _logger.LogInformation("📨 [EMAIL DISPATCHED] To: {Name} <{Email}> | Subject: {Subject}", recipientName, recipientEmail, subject);
        _logger.LogInformation("🔗 Ticket Live Tracking Link: http://localhost:5173/?track={OrderCode}", orderCode);
        _logger.LogInformation("===============================================================================");

        // 3. Send via SMTP if configured in appsettings.json
        var smtpHost = _configuration["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            _logger.LogInformation("SMTP host is not configured. Email logged to disk & console successfully.");
            return;
        }

        try
        {
            int smtpPort = int.TryParse(_configuration["Smtp:Port"], out var port) ? port : 587;
            var smtpUser = _configuration["Smtp:Username"];
            var smtpPass = _configuration["Smtp:Password"];
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "orders@gracieskitchen.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Gracie's Kitchen";
            bool enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            using var message = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };
            message.To.Add(new MailAddress(recipientEmail, recipientName));

            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPass))
            {
                smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPass);
            }

            await smtpClient.SendMailAsync(message);
            _logger.LogInformation("Successfully sent live email via SMTP to {Email}", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not send live SMTP email to {Email}. Email remains accessible via ticket dump.", recipientEmail);
        }
    }

    private static string BuildOrderTicketHtml(Order order, string trackingUrl)
    {
        var itemsBuilder = new StringBuilder();
        foreach (var item in order.OrderItems)
        {
            var extrasList = item.OrderItemExtras != null && item.OrderItemExtras.Count > 0
                ? string.Join(", ", item.OrderItemExtras.Select(e => $"{e.Quantity}x {e.ExtraProteinName}"))
                : string.Empty;

            itemsBuilder.Append($@"
            <tr style=""border-bottom: 1px solid #2a2521;"">
                <td style=""padding: 12px 8px; color: #f4efe6; font-size: 14px;"">
                    <strong>{item.Litres}L {item.FoodName}</strong><br/>
                    <span style=""color: #a89f91; font-size: 12px;"">{item.ProteinName} &bull; {item.PepperLevel} Pepper &bull; {item.SpiceLevel} Spice</span>
                    {(string.IsNullOrEmpty(extrasList) ? "" : $"<br/><span style=\"color: #d4a373; font-size: 11px;\">+ Extras: {extrasList}</span>")}
                </td>
                <td style=""padding: 12px 8px; text-align: right; color: #e9c46a; font-weight: bold; font-size: 14px;"">
                    &#8358;{item.ItemTotal:N0}
                </td>
            </tr>");
        }

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8""/>
    <title>Gracie's Kitchen Order Ticket #{order.OrderCode}</title>
</head>
<body style=""margin: 0; padding: 24px; background-color: #12100e; font-family: 'Segoe UI', Arial, sans-serif; color: #f4efe6;"">
    <div style=""max-width: 600px; margin: 0 auto; background: #1a1715; border-radius: 14px; border: 1px solid #332b25; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"">
        
        <!-- Header -->
        <div style=""background: linear-gradient(135deg, #2b1f17, #1f1813); padding: 32px 24px; text-align: center; border-bottom: 2px solid #e9c46a;"">
            <h1 style=""margin: 0; font-size: 24px; color: #e9c46a; letter-spacing: 2px; text-transform: uppercase;"">Gracie's Kitchen</h1>
            <p style=""margin: 6px 0 0; color: #c4b5a5; font-size: 13px;"">Private Chef Litre-Based Culinary Dispatch</p>
            
            <div style=""margin-top: 20px; display: inline-block; background: #2f251d; border: 1px dashed #e9c46a; border-radius: 8px; padding: 10px 24px;"">
                <span style=""display: block; font-size: 11px; text-transform: uppercase; color: #a89f91; letter-spacing: 1px;"">Your Tracking Ticket Code</span>
                <span style=""display: block; font-size: 26px; font-weight: 800; color: #e9c46a; letter-spacing: 3px;"">{order.OrderCode}</span>
            </div>
        </div>

        <!-- Body -->
        <div style=""padding: 28px 24px;"">
            <p style=""font-size: 16px; margin-top: 0;"">Hello <strong>{order.CustomerName}</strong>,</p>
            <p style=""color: #d1c7bc; font-size: 14px; line-height: 1.6;"">
                Chef Gracie has received your fresh kitchen order! Every pot is individually seasoned and prepared to order.
                You can use your unique ticket code to check your live preparation and delivery status anytime until it arrives.
            </p>

            <!-- Call to Action -->
            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{trackingUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #d4a373, #e9c46a); color: #12100e; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(233,196,106,0.35); text-transform: uppercase; letter-spacing: 1px;"">
                    Track Your Order Ticket Live &#8594;
                </a>
                <p style=""margin: 10px 0 0; font-size: 11px; color: #8e8476;"">Or visit: <a href=""{trackingUrl}"" style=""color: #e9c46a;"">{trackingUrl}</a></p>
            </div>

            <!-- Order Details Box -->
            <div style=""background: #221d19; border-radius: 8px; padding: 18px; margin-bottom: 24px; border: 1px solid #332b25;"">
                <h3 style=""margin: 0 0 12px; color: #e9c46a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;"">Dispatch Summary</h3>
                <p style=""margin: 4px 0; font-size: 13px; color: #c4b5a5;""><strong>Current Status:</strong> <span style=""color: #52b788; font-weight: bold;"">{order.Status}</span></p>
                <p style=""margin: 4px 0; font-size: 13px; color: #c4b5a5;""><strong>Scheduled Delivery:</strong> {order.RequestedDeliveryTime:f}</p>
                <p style=""margin: 4px 0; font-size: 13px; color: #c4b5a5;""><strong>Delivery Address:</strong> {order.DeliveryAddress}</p>
                {(string.IsNullOrEmpty(order.OrderNotes) ? "" : $"<p style=\"margin: 4px 0; font-size: 13px; color: #c4b5a5;\"><strong>Special Notes:</strong> {order.OrderNotes}</p>")}
            </div>

            <!-- Items Table -->
            <table style=""width: 100%; border-collapse: collapse; margin-bottom: 20px;"">
                <thead>
                    <tr style=""border-bottom: 1px solid #3d342c; text-align: left;"">
                        <th style=""padding: 8px; color: #a89f91; font-size: 12px; text-transform: uppercase;"">Dishes / Litres</th>
                        <th style=""padding: 8px; text-align: right; color: #a89f91; font-size: 12px; text-transform: uppercase;"">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsBuilder}
                </tbody>
            </table>

            <!-- Financial Totals -->
            <div style=""border-top: 1px solid #332b25; padding-top: 14px; text-align: right;"">
                <p style=""margin: 4px 0; font-size: 13px; color: #a89f91;"">Subtotal: &#8358;{order.Subtotal:N0}</p>
                {(order.VolumeDiscountSavings > 0 ? $"<p style=\"margin: 4px 0; font-size: 13px; color: #52b788;\">&#127881; Volume Discount Savings: -&#8358;{order.VolumeDiscountSavings:N0}</p>" : "")}
                <p style=""margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #e9c46a;"">Authoritative Grand Total: &#8358;{order.GrandTotal:N0}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style=""background: #151210; padding: 18px 24px; text-align: center; border-top: 1px solid #2a2521; font-size: 12px; color: #7d7265;"">
            <p style=""margin: 0;"">Need immediate assistance with this ticket? Call or WhatsApp Chef Gracie at +234 800 000 0000.</p>
            <p style=""margin: 6px 0 0;"">&copy; {DateTime.UtcNow.Year} Gracie's Kitchen. Freshly Crafted. Authoritatively Priced.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string BuildStatusUpdateHtml(Order order, string trackingUrl, string oldStatus, string newStatus)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8""/>
    <title>Ticket #{order.OrderCode} Status Update: {newStatus}</title>
</head>
<body style=""margin: 0; padding: 24px; background-color: #12100e; font-family: 'Segoe UI', Arial, sans-serif; color: #f4efe6;"">
    <div style=""max-width: 600px; margin: 0 auto; background: #1a1715; border-radius: 14px; border: 1px solid #332b25; overflow: hidden;"">
        <div style=""background: #241a13; padding: 24px; text-align: center; border-bottom: 2px solid #e9c46a;"">
            <h1 style=""margin: 0; font-size: 22px; color: #e9c46a; letter-spacing: 2px;"">GRACIE'S KITCHEN</h1>
            <p style=""margin: 4px 0 0; color: #a89f91; font-size: 12px;"">TICKET STATUS NOTIFICATION</p>
        </div>
        <div style=""padding: 24px;"">
            <p style=""font-size: 15px;"">Dear <strong>{order.CustomerName}</strong>,</p>
            <p style=""color: #d1c7bc; font-size: 14px; line-height: 1.6;"">
                The status of your order ticket <strong>#{order.OrderCode}</strong> has been updated:
            </p>
            <div style=""text-align: center; margin: 24px 0; padding: 18px; background: #221d19; border-radius: 8px; border: 1px solid #3d342c;"">
                <span style=""display: block; font-size: 12px; color: #8e8476; text-transform: uppercase;"">Current Status</span>
                <span style=""display: block; font-size: 24px; font-weight: bold; color: #52b788; margin-top: 4px;"">{newStatus}</span>
                <span style=""display: block; font-size: 12px; color: #a89f91; margin-top: 4px;"">(Previous: {oldStatus})</span>
            </div>
            <div style=""text-align: center; margin-top: 24px;"">
                <a href=""{trackingUrl}"" style=""display: inline-block; background: #e9c46a; color: #12100e; font-weight: 700; padding: 12px 28px; border-radius: 25px; text-decoration: none;"">
                    View Live Ticket Progress &#8594;
                </a>
            </div>
        </div>
    </div>
</body>
</html>";
    }
}
