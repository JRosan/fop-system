using FopSystem.Domain.Aggregates.Aircraft;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Entities;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence;

public class FopDbContext : DbContext, IUnitOfWork
{
    private readonly IMediator? _mediator;
    private readonly ITenantContext? _tenantContext;

    /// <summary>
    /// The current tenant ID used for global query filters.
    /// This is set from ITenantContext and used by EF Core query filters.
    /// </summary>
    public Guid CurrentTenantId => _tenantContext?.HasTenant == true ? _tenantContext.TenantId : Guid.Empty;

    // Tenant entity (not tenant-scoped)
    public DbSet<Tenant> Tenants => Set<Tenant>();

    // Tenant-scoped entities
    public DbSet<FopApplication> Applications => Set<FopApplication>();
    public DbSet<Operator> Operators => Set<Operator>();
    public DbSet<Aircraft> Aircraft => Set<Aircraft>();
    public DbSet<Permit> Permits => Set<Permit>();
    public DbSet<ApplicationDocument> Documents => Set<ApplicationDocument>();
    public DbSet<ApplicationPayment> Payments => Set<ApplicationPayment>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<FeeConfiguration> FeeConfigurations => Set<FeeConfiguration>();

    // BVIAA Revenue entities (tenant-scoped)
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

    public FopDbContext(
        DbContextOptions<FopDbContext> options,
        IMediator mediator,
        ITenantContext tenantContext) : base(options)
    {
        _mediator = mediator;
        _tenantContext = tenantContext;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FopDbContext).Assembly);

        // Apply global query filters for tenant isolation
        ConfigureTenantQueryFilters(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }

    private void ConfigureTenantQueryFilters(ModelBuilder modelBuilder)
    {
        // Apply query filter to all tenant-scoped entities
        // These filters automatically exclude entities from other tenants

        modelBuilder.Entity<FopApplication>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<Operator>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<Aircraft>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<Permit>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<User>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<AuditLog>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<FeeConfiguration>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<BviaInvoice>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<BviaFeeRate>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);

        modelBuilder.Entity<OperatorAccountBalance>()
            .HasQueryFilter(e => CurrentTenantId == Guid.Empty || e.TenantId == CurrentTenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-set TenantId on new tenant-scoped entities
        SetTenantIdOnNewEntities();

        // Ensure new ApplicationPayment entities are properly tracked as Added
        await EnsurePaymentTrackingAsync(cancellationToken);

        var domainEvents = GetDomainEvents();

        var result = await base.SaveChangesAsync(cancellationToken);

        if (_mediator is not null)
        {
            await DispatchDomainEventsAsync(domainEvents, cancellationToken);
        }

        return result;
    }

    private void SetTenantIdOnNewEntities()
    {
        if (_tenantContext?.HasTenant != true)
            return;

        var tenantId = _tenantContext.TenantId;

        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                entry.Entity.SetTenantId(tenantId);
            }
        }
    }

    private async Task EnsurePaymentTrackingAsync(CancellationToken cancellationToken)
    {
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

    /// <summary>
    /// Ignores the tenant filter for the current query context.
    /// Use with caution - typically only for cross-tenant administrative operations.
    /// </summary>
    public IQueryable<T> IgnoreTenantFilter<T>() where T : class
    {
        return Set<T>().IgnoreQueryFilters();
    }
}
