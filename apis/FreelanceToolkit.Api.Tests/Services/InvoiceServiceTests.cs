using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services;
using FreelanceToolkit.Api.Services.Interfaces;
using Moq;

namespace FreelanceToolkit.Api.Tests.Services;

public class InvoiceServiceTests : TestBase
{
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IPdfService> _mockPdfService;
    private readonly InvoiceService _invoiceService;

    public InvoiceServiceTests()
    {
        _mockEmailService = new Mock<IEmailService>();
        _mockPdfService = new Mock<IPdfService>();
        var logger = CreateLogger<InvoiceService>();

        _invoiceService = new InvoiceService(
            Context,
            Mapper,
            _mockEmailService.Object,
            _mockPdfService.Object,
            logger.Object
        );
    }

    [Fact]
    public async Task SendAsync_SendsInvoice_Successfully()
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

        var invoiceId = Guid.NewGuid();
        var invoice = new Invoice
        {
            Id = invoiceId,
            InvoiceNumber = "INV-001",
            ClientId = client.Id,
            Client = client, // Explicitly set navigation property
            UserId = UserId,
            Status = InvoiceStatus.Draft,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            SubTotal = 1000,
            TaxAmount = 100,
            Total = 1100,
        };
        Context.Invoices.Add(invoice);
        await Context.SaveChangesAsync();

        _mockPdfService
            .Setup(x => x.GenerateInvoicePdfAsync(invoiceId, UserId))
            .ReturnsAsync(new byte[] { 1, 2, 3 });

        // Act
        var result = await _invoiceService.SendAsync(invoiceId, UserId);

        // Assert
        Assert.Equal(InvoiceStatus.Sent, Enum.Parse<InvoiceStatus>(result.Status));
        Assert.Equal("Test Client", result.ClientName);
        _mockEmailService.Verify(
            x =>
                x.SendInvoiceAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<decimal>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<string>(),
                    It.IsAny<byte[]>(),
                    It.IsAny<string>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task SendAsync_ThrowsException_WhenInvoiceNotDraft()
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

        var invoiceId = Guid.NewGuid();
        var invoice = new Invoice
        {
            Id = invoiceId,
            InvoiceNumber = "INV-001",
            ClientId = client.Id,
            UserId = UserId,
            Status = InvoiceStatus.Sent,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            Total = 1000,
        };
        Context.Invoices.Add(invoice);
        await Context.SaveChangesAsync();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _invoiceService.SendAsync(invoiceId, UserId)
        );
    }
}
