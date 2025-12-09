using FreelanceToolkit.Api.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace FreelanceToolkit.Api.Tests.Services;

public class EmailServiceTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly EmailService _emailService;

    public EmailServiceTests()
    {
        _mockConfig = new Mock<IConfiguration>();

        // Setup configuration
        _mockConfig.Setup(x => x["Email:SmtpHost"]).Returns("smtp.test.com");
        _mockConfig.Setup(x => x["Email:SmtpPort"]).Returns("587");
        _mockConfig.Setup(x => x["Email:SmtpUser"]).Returns("test@test.com");
        _mockConfig.Setup(x => x["Email:SmtpPassword"]).Returns("password");
        _mockConfig.Setup(x => x["Email:FromAddress"]).Returns("noreply@test.com");
        _mockConfig.Setup(x => x["Email:FromName"]).Returns("Test System");
        _mockConfig.Setup(x => x["Email:UseSsl"]).Returns("true");

        var logger = new Mock<Microsoft.Extensions.Logging.ILogger<EmailService>>();
        _emailService = new EmailService(_mockConfig.Object, logger.Object);
    }

    [Fact]
    public void EmailService_Initializes_Successfully()
    {
        // Arrange & Act - Service created in constructor

        // Assert
        Assert.NotNull(_emailService);
    }

    // Note: Actual SMTP sending tests would require integration testing
    // or a test SMTP server. These tests verify the service can be constructed
    // and configured correctly.
}
