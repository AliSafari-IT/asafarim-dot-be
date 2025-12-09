using FreelanceToolkit.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace FreelanceToolkit.Api.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        // Create default admin user if none exists
        if (!userManager.Users.Any())
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@asafarim.be",
                Email = "admin@asafarim.be",
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                CompanyName = "ASafariM",
                CreatedAt = DateTime.UtcNow,
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                // Create default proposal template
                var defaultTemplate = new ProposalTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Default Proposal Template",
                    Content =
                        @"# Project Proposal

## Dear {{clientName}},

Thank you for your interest in working with me. Below is my proposal for {{projectScope}}.

### Project Scope
{{projectScope}}

### Timeline
- Start Date: {{startDate}}
- End Date: {{endDate}}

### Investment
{{pricingTable}}

### Terms & Conditions
{{disclaimer}}

I look forward to working with you!

Best regards,
ASafariM",
                    IsDefault = true,
                    Version = 1,
                    UserId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                context.ProposalTemplates.Add(defaultTemplate);
                await context.SaveChangesAsync();
            }
        }
    }
}
