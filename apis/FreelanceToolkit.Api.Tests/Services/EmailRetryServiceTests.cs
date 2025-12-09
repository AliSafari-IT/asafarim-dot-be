using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using Moq;

namespace FreelanceToolkit.Api.Tests.Services;

public class EmailRetryServiceTests : TestBase
{
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IPdfService> _mockPdfService;
    private readonly EmailRetryService _retryService;
    private readonly EmailRetryConfiguration _config;

    public EmailRetryServiceTests()
    {
        _mockEmailService = new Mock<IEmailService>();
        _mockPdfService = new Mock<IPdfService>();
        _config = new EmailRetryConfiguration { MaxRetries = 4, BaseDelayMinutes = 1 };

        var options = Options.Create(_config);
        var logger = CreateLogger<EmailRetryService>();

        _retryService = new EmailRetryService(
            Context,
            _mockEmailService.Object,
            _mockPdfService.Object,
            logger.Object,
            options
        );
    }

    [Fact]
    public async Task ProcessRetries_RunsWithoutErrors()
    {
        // Arrange
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Test Client",
            Email = "client@test.com",
            UserId = UserId,
        };
        Context.Clients.Add(client);

        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            ProposalNumber = "PROP-001",
            Title = "Failed Proposal",
            ClientId = client.Id,
            Client = client,
            UserId = UserId,
            Status = ProposalStatus.Sent,
            TotalAmount = 5000,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            DeliveryStatus = EmailDeliveryStatus.Failed,
            LastAttemptAt = DateTime.UtcNow.AddMinutes(-5),
            RetryCount = 0,
        };

        Context.Proposals.Add(proposal);
        await Context.SaveChangesAsync();

        _mockPdfService
            .Setup(x => x.GenerateProposalPdfAsync(It.IsAny<Guid>(), It.IsAny<string>()))
            .ReturnsAsync(new byte[] { 1, 2, 3 });

        // Act
        await _retryService.ProcessRetries();

        // Assert
        // Test verifies the retry process completes without throwing exceptions
        var updated = await Context.Proposals.FindAsync(proposal.Id);
        Assert.NotNull(updated);
    }

    [Fact]
    public async Task ProcessRetries_HandlesFailedInvoices()
    {
        // Arrange - Create a failed invoice scenario
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Test Client",
            Email = "client@test.com",
            UserId = UserId,
        };
        Context.Clients.Add(client);

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            InvoiceNumber = "INV-001",
            ClientId = client.Id,
            Client = client,
            UserId = UserId,
            Status = InvoiceStatus.Sent,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            Total = 1000,
            DeliveryStatus = EmailDeliveryStatus.Failed,
            LastAttemptAt = DateTime.UtcNow.AddMinutes(-5),
            RetryCount = 0,
        };

        Context.Invoices.Add(invoice);
        await Context.SaveChangesAsync();

        // Act
        await _retryService.ProcessRetries();

        // Assert - Verify no exceptions thrown
        var updated = await Context.Invoices.FindAsync(invoice.Id);
        Assert.NotNull(updated);
    }

    [Fact]
    public async Task RetryFailed_SkipsMaxRetriesExceeded()
    {
        // Arrange
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Email = "test@test.com",
            UserId = UserId,
        };
        Context.Clients.Add(client);

        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            ProposalNumber = "PROP-MAXED",
            Title = "Maxed Retries",
            ClientId = client.Id,
            Client = client,
            UserId = UserId,
            Status = ProposalStatus.Sent,
            TotalAmount = 5000,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            DeliveryStatus = EmailDeliveryStatus.Failed,
            LastAttemptAt = DateTime.UtcNow.AddHours(-1),
            RetryCount = 4, // Already at max
        };

        Context.Proposals.Add(proposal);
        await Context.SaveChangesAsync();

        // Act
        await _retryService.ProcessRetries();

        // Assert
        var updated = await Context.Proposals.FindAsync(proposal.Id);
        Assert.NotNull(updated);
        Assert.Equal(EmailDeliveryStatus.Failed, updated.DeliveryStatus);
        Assert.Equal(4, updated.RetryCount); // Should not increment
    }

    [Fact]
    public async Task RetryFailed_RespectsExponentialBackoff()
    {
        // Arrange
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Email = "test@test.com",
            UserId = UserId,
        };
        Context.Clients.Add(client);

        // Proposal with retry count 2 should wait 4 minutes (2^2 * 1)
        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            ProposalNumber = "PROP-BACKOFF",
            Title = "Backoff Test",
            ClientId = client.Id,
            Client = client,
            UserId = UserId,
            Status = ProposalStatus.Sent,
            TotalAmount = 5000,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            DeliveryStatus = EmailDeliveryStatus.Failed,
            LastAttemptAt = DateTime.UtcNow.AddMinutes(-2), // Only 2 minutes ago
            RetryCount = 2,
        };

        Context.Proposals.Add(proposal);
        await Context.SaveChangesAsync();

        // Act
        await _retryService.ProcessRetries();

        // Assert
        var updated = await Context.Proposals.FindAsync(proposal.Id);
        Assert.NotNull(updated);
        Assert.Equal(EmailDeliveryStatus.Failed, updated.DeliveryStatus);
        Assert.Equal(2, updated.RetryCount); // Should not retry yet
    }
}
