using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class BviaInvoiceRepository : IBviaInvoiceRepository
{
    private readonly FopDbContext _context;

    public BviaInvoiceRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<BviaInvoice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(BviaInvoice entity, CancellationToken cancellationToken = default)
    {
        await _context.BviaInvoices.AddAsync(entity, cancellationToken);
    }

    public void Update(BviaInvoice entity)
    {
        _context.BviaInvoices.Update(entity);
    }

    public void Remove(BviaInvoice entity)
    {
        _context.BviaInvoices.Remove(entity);
    }

    public async Task<BviaInvoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber, cancellationToken);
    }

    public async Task<BviaInvoice?> GetByApplicationIdAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.FopApplicationId == applicationId, cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => i.OperatorId == operatorId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetByStatusAsync(BviaInvoiceStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => i.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetOverdueInvoicesAsync(DateOnly asOfDate, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => i.Status == BviaInvoiceStatus.Overdue)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetInvoicesDueForOverdueProcessingAsync(DateOnly asOfDate, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => (i.Status == BviaInvoiceStatus.Pending || i.Status == BviaInvoiceStatus.PartiallyPaid) &&
                        i.DueDate < asOfDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BviaInvoice>> GetUnpaidByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default)
    {
        return await _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => i.OperatorId == operatorId &&
                        i.Status != BviaInvoiceStatus.Paid &&
                        i.Status != BviaInvoiceStatus.Cancelled &&
                        i.Status != BviaInvoiceStatus.Draft)
            .OrderByDescending(i => i.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<BviaInvoice> Items, int TotalCount)> GetPagedAsync(
        BviaInvoiceStatus[]? statuses = null,
        Guid? operatorId = null,
        BviAirport? airport = null,
        DateOnly? invoiceDateFrom = null,
        DateOnly? invoiceDateTo = null,
        DateOnly? flightDateFrom = null,
        DateOnly? flightDateTo = null,
        bool? isOverdue = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BviaInvoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .AsQueryable();

        if (statuses is { Length: > 0 })
        {
            query = query.Where(i => statuses.Contains(i.Status));
        }

        if (operatorId.HasValue)
        {
            query = query.Where(i => i.OperatorId == operatorId.Value);
        }

        if (airport.HasValue)
        {
            query = query.Where(i => i.ArrivalAirport == airport.Value);
        }

        if (invoiceDateFrom.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= invoiceDateFrom.Value);
        }

        if (invoiceDateTo.HasValue)
        {
            query = query.Where(i => i.InvoiceDate <= invoiceDateTo.Value);
        }

        if (flightDateFrom.HasValue)
        {
            query = query.Where(i => i.FlightDate >= flightDateFrom.Value);
        }

        if (flightDateTo.HasValue)
        {
            query = query.Where(i => i.FlightDate <= flightDateTo.Value);
        }

        if (isOverdue.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (isOverdue.Value)
            {
                query = query.Where(i => i.DueDate < today &&
                                         i.Status != BviaInvoiceStatus.Paid &&
                                         i.Status != BviaInvoiceStatus.Cancelled);
            }
            else
            {
                query = query.Where(i => i.DueDate >= today ||
                                         i.Status == BviaInvoiceStatus.Paid ||
                                         i.Status == BviaInvoiceStatus.Cancelled);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i =>
                i.InvoiceNumber.Contains(search) ||
                (i.AircraftRegistration != null && i.AircraftRegistration.Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(i => i.InvoiceDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
