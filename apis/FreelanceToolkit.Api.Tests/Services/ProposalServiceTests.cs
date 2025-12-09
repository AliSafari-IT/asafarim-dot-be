using FreelanceToolkit.Api.DTOs.Proposal;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services;
using FreelanceToolkit.Api.Services.Interfaces;
using Moq;

namespace FreelanceToolkit.Api.Tests.Services;

public class ProposalServiceTests : TestBase
{
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IPdfService> _mockPdfService;
    private readonly ProposalService _proposalService;

    public ProposalServiceTests()
    {
        _mockEmailService = new Mock<IEmailService>();
        _mockPdfService = new Mock<IPdfService>();
        var logger = CreateLogger<ProposalService>();

        _proposalService = new ProposalService(
            Context,
            Mapper,
            _mockEmailService.Object,
            _mockPdfService.Object,
            logger.Object
        );
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllProposalsForUser()
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
            Title = "Website Development",
            ClientId = client.Id,
            Client = client, // Explicitly set navigation property
            UserId = UserId,
            Status = ProposalStatus.Draft,
            TotalAmount = 5000,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
        };

        Context.Proposals.Add(proposal);
        await Context.SaveChangesAsync();

        // Act
        var result = await _proposalService.GetAllAsync(UserId);

        // Assert
        Assert.Single(result);
        Assert.Equal("PROP-001", result[0].ProposalNumber);
        Assert.Equal("Test Client", result[0].ClientName);
    }

    [Fact]
    public async Task GetByIdAsync_ThrowsException_WhenNotFound()
    {
        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            async () => await _proposalService.GetByIdAsync(Guid.NewGuid(), UserId)
        );
    }

    [Fact]
    public async Task SendAsync_SendsEmail_Successfully()
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

        var proposalId = Guid.NewGuid();
        var proposal = new Proposal
        {
            Id = proposalId,
            ProposalNumber = "PROP-001",
            Title = "Website",
            ClientId = client.Id,
            Client = client, // Explicitly set navigation property
            UserId = UserId,
            Status = ProposalStatus.Draft,
            TotalAmount = 5000,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
        };
        Context.Proposals.Add(proposal);
        await Context.SaveChangesAsync();

        _mockPdfService
            .Setup(x => x.GenerateProposalPdfAsync(proposalId, UserId))
            .ReturnsAsync(new byte[] { 1, 2, 3 });

        // Act
        var result = await _proposalService.SendAsync(proposalId, UserId);

        // Assert
        Assert.Equal(ProposalStatus.Sent, Enum.Parse<ProposalStatus>(result.Status));
        Assert.NotNull(result.SentAt);
        _mockEmailService.Verify(
            x =>
                x.SendProposalAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<decimal>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<byte[]>(),
                    It.IsAny<string>()
                ),
            Times.Once
        );
    }
}
