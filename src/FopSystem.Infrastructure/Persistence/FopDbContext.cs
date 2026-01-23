using FopSystem.Domain.Aggregates.Aircraft;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence;

public class FopDbContext : DbContext, IUnitOfWork
{
    private readonly IMediator? _mediator;

    public DbSet<FopApplication> Applications => Set<FopApplication>();
    public DbSet<Operator> Operators => Set<Operator>();
    public DbSet<Aircraft> Aircraft => Set<Aircraft>();
    public DbSet<Permit> Permits => Set<Permit>();
    public DbSet<ApplicationDocument> Documents => Set<ApplicationDocument>();
    public DbSet<ApplicationPayment> Payments => Set<ApplicationPayment>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<FeeConfiguration> FeeConfigurations => Set<FeeConfiguration>();

    // BVIAA Revenue entities
    public DbSet<BviaInvoice> BviaInvoices => Set<BviaInvoice>();
    public DbSet<BviaInvoiceLineItem> BviaInvoiceLineItems => Set<BviaInvoiceLineItem>();
    public DbSet<BviaPayment> BviaPayments => Set<BviaPayment>();
    public DbSet<BviaFeeRate> BviaFeeRates => Set<BviaFeeRate>();
    public DbSet<OperatorAccountBalance> OperatorAccountBalances => Set<OperatorAccountBalance>();

    public FopDbContext(DbContextOptions<FopDbContext> options) : base(options)
    {
    }

    public FopDbContext(DbContextOptions<FopDbContext> options, IMediator mediator) : base(options)
    {
        _mediator = mediator;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FopDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Ensure new ApplicationPayment entities are properly tracked as Added
        foreach (var entry in ChangeTracker.Entries<FopApplication>())
        {
            if (entry.Entity.Payment != null)
            {
                var paymentEntry = Entry(entry.Entity.Payment);
                // If the payment doesn't exist in the database (checking by State),
                // and it's being tracked as Modified or Unchanged but doesn't exist, mark it as Added
                if (paymentEntry.State == EntityState.Modified || paymentEntry.State == EntityState.Unchanged)
                {
                    // Check if the payment actually exists in the database
                    var existsInDb = await Payments
                        .AsNoTracking()
                        .AnyAsync(p => p.Id == entry.Entity.Payment.Id, cancellationToken);

                    if (!existsInDb)
                    {
                        paymentEntry.State = EntityState.Added;
                    }
                }
            }
        }

        var domainEvents = GetDomainEvents();

        var result = await base.SaveChangesAsync(cancellationToken);

        if (_mediator is not null)
        {
            await DispatchDomainEventsAsync(domainEvents, cancellationToken);
        }

        return result;
    }

    private List<IDomainEvent> GetDomainEvents()
    {
        var aggregateRoots = ChangeTracker
            .Entries<AggregateRoot<Guid>>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = aggregateRoots
            .SelectMany(a => a.DomainEvents)
            .ToList();

        foreach (var aggregateRoot in aggregateRoots)
        {
            aggregateRoot.ClearDomainEvents();
        }

        return domainEvents;
    }

    private async Task DispatchDomainEventsAsync(
        IReadOnlyList<IDomainEvent> domainEvents,
        CancellationToken cancellationToken)
    {
        foreach (var domainEvent in domainEvents)
        {
            await _mediator!.Publish(domainEvent, cancellationToken);
        }
    }
}
