using FreelanceToolkit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Data;

// NOTE: This DbContext only manages business data (proposals, invoices, clients, bookings)
// User authentication and identity management is handled by the centralized Identity.Api
// UserId fields are strings that reference user IDs from Identity.Api's database
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ProposalTemplate> ProposalTemplates => Set<ProposalTemplate>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<ProposalLineItem> ProposalLineItems => Set<ProposalLineItem>();
    public DbSet<ProposalVersion> ProposalVersions => Set<ProposalVersion>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<CalendarBooking> CalendarBookings => Set<CalendarBooking>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Client configuration
        builder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email);
            entity.Property(e => e.Tags).HasColumnType("jsonb");
            // UserId is a string reference to Identity.Api users
            entity.HasIndex(e => e.UserId);
        });

        // ProposalTemplate configuration
        builder.Entity<ProposalTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            // UserId is a string reference to Identity.Api users
            entity.HasIndex(e => e.UserId);
        });

        // Proposal configuration
        builder.Entity<Proposal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProposalNumber).IsUnique();
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

            entity
                .HasOne(e => e.Client)
                .WithMany(c => c.Proposals)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Template)
                .WithMany(t => t.Proposals)
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            // UserId is a string reference to Identity.Api users
            entity.HasIndex(e => e.UserId);
        });

        // ProposalLineItem configuration
        builder.Entity<ProposalLineItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

            entity
                .HasOne(e => e.Proposal)
                .WithMany(p => p.LineItems)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ProposalVersion configuration
        builder.Entity<ProposalVersion>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity
                .HasOne(e => e.Proposal)
                .WithMany(p => p.Versions)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Invoice configuration
        builder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.Property(e => e.SubTotal).HasPrecision(18, 2);
            entity.Property(e => e.TaxAmount).HasPrecision(18, 2);
            entity.Property(e => e.Total).HasPrecision(18, 2);

            entity
                .HasOne(e => e.Client)
                .WithMany(c => c.Invoices)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Proposal)
                .WithMany(p => p.Invoices)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.SetNull);

            // UserId is a string reference to Identity.Api users
            entity.HasIndex(e => e.UserId);
        });

        // InvoiceLineItem configuration
        builder.Entity<InvoiceLineItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

            entity
                .HasOne(e => e.Invoice)
                .WithMany(i => i.LineItems)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CalendarBooking configuration
        builder.Entity<CalendarBooking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StartTime);

            entity
                .HasOne(e => e.Client)
                .WithMany(c => c.CalendarBookings)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.SetNull);

            // UserId is a string reference to Identity.Api users
            entity.HasIndex(e => e.UserId);
        });
    }
}
