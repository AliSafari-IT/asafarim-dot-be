using FreelanceToolkit.Api.Services;

namespace FreelanceToolkit.Api.BackgroundServices;

public class EmailRetryBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailRetryBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(5); // Run every 5 minutes

    public EmailRetryBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<EmailRetryBackgroundService> logger
    )
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[EmailRetryBackgroundService] Started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var retryService =
                        scope.ServiceProvider.GetRequiredService<IEmailRetryService>();
                    await retryService.ProcessRetries();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[EmailRetryBackgroundService] Error processing email retries"
                );
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("[EmailRetryBackgroundService] Stopped");
    }
}
