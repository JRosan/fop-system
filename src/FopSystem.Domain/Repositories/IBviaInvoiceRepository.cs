using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Repositories;

public interface IBviaInvoiceRepository : IRepository<BviaInvoice, Guid>
{
    Task<BviaInvoice?> GetByInvoiceNumberAsync(string invoiceNumber, CancellationToken cancellationToken = default);

    Task<BviaInvoice?> GetByApplicationIdAsync(Guid applicationId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaInvoice>> GetByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaInvoice>> GetByStatusAsync(BviaInvoiceStatus status, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaInvoice>> GetOverdueInvoicesAsync(DateOnly asOfDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaInvoice>> GetInvoicesDueForOverdueProcessingAsync(DateOnly asOfDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BviaInvoice>> GetUnpaidByOperatorIdAsync(Guid operatorId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<BviaInvoice> Items, int TotalCount)> GetPagedAsync(
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
        CancellationToken cancellationToken = default);
}
