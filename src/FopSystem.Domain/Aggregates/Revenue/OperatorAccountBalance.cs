using FopSystem.Domain.Entities;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Aggregates.Revenue;

public class OperatorAccountBalance : AggregateRoot<Guid>, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public Guid OperatorId { get; private set; }

    public Money TotalInvoiced { get; private set; } = default!;
    public Money TotalPaid { get; private set; } = default!;
    public Money TotalInterest { get; private set; } = default!;
    public Money CurrentBalance { get; private set; } = default!;
    public Money TotalOverdue { get; private set; } = default!;

    public int InvoiceCount { get; private set; }
    public int PaidInvoiceCount { get; private set; }
    public int OverdueInvoiceCount { get; private set; }

    public DateTime? LastInvoiceDate { get; private set; }
    public DateTime? LastPaymentDate { get; private set; }

    private OperatorAccountBalance() { }

    public static OperatorAccountBalance Create(Guid operatorId)
    {
        if (operatorId == Guid.Empty)
            throw new ArgumentException("Operator ID is required", nameof(operatorId));

        return new OperatorAccountBalance
        {
            Id = Guid.NewGuid(),
            OperatorId = operatorId,
            TotalInvoiced = Money.Zero(),
            TotalPaid = Money.Zero(),
            TotalInterest = Money.Zero(),
            CurrentBalance = Money.Zero(),
            TotalOverdue = Money.Zero(),
            InvoiceCount = 0,
            PaidInvoiceCount = 0,
            OverdueInvoiceCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void RecordInvoiceFinalized(Money amount)
    {
        TotalInvoiced = TotalInvoiced.Add(amount);
        CurrentBalance = CurrentBalance.Add(amount);
        InvoiceCount++;
        LastInvoiceDate = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void RecordPayment(Money amount)
    {
        TotalPaid = TotalPaid.Add(amount);
        CurrentBalance = CurrentBalance.Subtract(amount);
        LastPaymentDate = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void RecordInvoicePaid()
    {
        PaidInvoiceCount++;
        SetUpdatedAt();
    }

    public void RecordInvoiceOverdue(Money overdueAmount)
    {
        TotalOverdue = TotalOverdue.Add(overdueAmount);
        OverdueInvoiceCount++;
        SetUpdatedAt();
    }

    public void RecordOverdueCleared(Money clearedAmount)
    {
        TotalOverdue = TotalOverdue.Subtract(clearedAmount);
        OverdueInvoiceCount = Math.Max(0, OverdueInvoiceCount - 1);
        SetUpdatedAt();
    }

    public void RecordInterestCharge(Money interestAmount)
    {
        TotalInterest = TotalInterest.Add(interestAmount);
        CurrentBalance = CurrentBalance.Add(interestAmount);
        TotalOverdue = TotalOverdue.Add(interestAmount);
        SetUpdatedAt();
    }

    public void RecordInvoiceCancelled(Money amount)
    {
        TotalInvoiced = TotalInvoiced.Subtract(amount);
        CurrentBalance = CurrentBalance.Subtract(amount);
        InvoiceCount = Math.Max(0, InvoiceCount - 1);
        SetUpdatedAt();
    }

    public bool HasOutstandingDebt => CurrentBalance.Amount > 0;

    public bool HasOverdueDebt => TotalOverdue.Amount > 0;

    public bool IsEligibleForPermitIssuance => !HasOverdueDebt;

    public void Recalculate(
        Money totalInvoiced,
        Money totalPaid,
        Money totalInterest,
        Money totalOverdue,
        int invoiceCount,
        int paidCount,
        int overdueCount)
    {
        TotalInvoiced = totalInvoiced;
        TotalPaid = totalPaid;
        TotalInterest = totalInterest;
        TotalOverdue = totalOverdue;
        CurrentBalance = totalInvoiced.Add(totalInterest).Subtract(totalPaid);
        InvoiceCount = invoiceCount;
        PaidInvoiceCount = paidCount;
        OverdueInvoiceCount = overdueCount;
        SetUpdatedAt();
    }

    public void SetTenantId(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        TenantId = tenantId;
    }
}
