using FluentAssertions;
using FopSystem.Application.Interfaces;
using FopSystem.Application.Revenue.Commands;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;
using NSubstitute;
using Xunit;

namespace FopSystem.Application.Tests.Revenue;

public class BviaPaymentRecordingTests
{
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly RecordBviaPaymentCommandHandler _handler;

    public BviaPaymentRecordingTests()
    {
        _invoiceRepository = Substitute.For<IBviaInvoiceRepository>();
        _accountBalanceRepository = Substitute.For<IOperatorAccountBalanceRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();

        _handler = new RecordBviaPaymentCommandHandler(
            _invoiceRepository,
            _accountBalanceRepository,
            _unitOfWork);
    }

    [Fact]
    public async Task Handle_WhenValidPayment_ShouldRecordAndUpdateBalance()
    {
        // Arrange
        var operatorId = Guid.NewGuid();
        var invoice = CreateInvoiceWithLineItems(operatorId);
        var accountBalance = OperatorAccountBalance.Create(operatorId);
        // Simulate that the invoice has been recorded in the account balance
        accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);

        _invoiceRepository.GetByIdAsync(invoice.Id, Arg.Any<CancellationToken>())
            .Returns(invoice);
        _accountBalanceRepository.GetOrCreateAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(accountBalance);

        var command = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: 500m,
            Method: PaymentMethod.BankTransfer,
            TransactionReference: "TXN-12345",
            Notes: "Partial payment",
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Amount.Amount.Should().Be(500m);
        result.Value.Method.Should().Be(PaymentMethod.BankTransfer);
        result.Value.TransactionReference.Should().Be("TXN-12345");
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenInvoiceNotFound_ShouldReturnNotFound()
    {
        // Arrange
        _invoiceRepository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((BviaInvoice?)null);

        var command = new RecordBviaPaymentCommand(
            InvoiceId: Guid.NewGuid(),
            Amount: 500m,
            Method: PaymentMethod.BankTransfer,
            TransactionReference: null,
            Notes: null,
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Contain("NotFound");
    }

    [Fact]
    public async Task Handle_WhenFullPayment_ShouldMarkInvoiceAsPaid()
    {
        // Arrange
        var operatorId = Guid.NewGuid();
        var invoice = CreateInvoiceWithLineItems(operatorId);
        var accountBalance = OperatorAccountBalance.Create(operatorId);
        // Simulate that the invoice has been recorded in the account balance
        accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);

        _invoiceRepository.GetByIdAsync(invoice.Id, Arg.Any<CancellationToken>())
            .Returns(invoice);
        _accountBalanceRepository.GetOrCreateAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(accountBalance);

        // Pay the full amount
        var command = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: invoice.TotalAmount.Amount,
            Method: PaymentMethod.CreditCard,
            TransactionReference: "CC-12345",
            Notes: "Full payment",
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        invoice.Status.Should().Be(BviaInvoiceStatus.Paid);
        invoice.BalanceDue.Amount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WhenPartialPayment_ShouldUpdateBalanceDue()
    {
        // Arrange
        var operatorId = Guid.NewGuid();
        var invoice = CreateInvoiceWithLineItems(operatorId);
        var accountBalance = OperatorAccountBalance.Create(operatorId);
        // Simulate that the invoice has been recorded in the account balance
        accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);
        var originalAmount = invoice.TotalAmount.Amount;

        _invoiceRepository.GetByIdAsync(invoice.Id, Arg.Any<CancellationToken>())
            .Returns(invoice);
        _accountBalanceRepository.GetOrCreateAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(accountBalance);

        // Pay partial amount
        var command = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: 200m,
            Method: PaymentMethod.BankTransfer,
            TransactionReference: null,
            Notes: "Partial payment",
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        invoice.Status.Should().Be(BviaInvoiceStatus.PartiallyPaid);
        invoice.BalanceDue.Amount.Should().Be(originalAmount - 200m);
        invoice.AmountPaid.Amount.Should().Be(200m);
    }

    [Fact]
    public async Task Handle_WithWireTransfer_ShouldRecordMethodCorrectly()
    {
        // Arrange
        var operatorId = Guid.NewGuid();
        var invoice = CreateInvoiceWithLineItems(operatorId);
        var accountBalance = OperatorAccountBalance.Create(operatorId);
        // Simulate that the invoice has been recorded in the account balance
        accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);

        _invoiceRepository.GetByIdAsync(invoice.Id, Arg.Any<CancellationToken>())
            .Returns(invoice);
        _accountBalanceRepository.GetOrCreateAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(accountBalance);

        var command = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: 300m,
            Method: PaymentMethod.WireTransfer,
            TransactionReference: "WIRE-98765",
            Notes: "Wire transfer payment",
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Method.Should().Be(PaymentMethod.WireTransfer);
        result.Value.TransactionReference.Should().Be("WIRE-98765");
    }

    [Fact]
    public async Task Handle_MultiplePayments_ShouldAccumulateCorrectly()
    {
        // Arrange
        var operatorId = Guid.NewGuid();
        var invoice = CreateInvoiceWithLineItems(operatorId);
        var accountBalance = OperatorAccountBalance.Create(operatorId);
        // Simulate that the invoice has been recorded in the account balance
        accountBalance.RecordInvoiceFinalized(invoice.TotalAmount);
        var totalAmount = invoice.TotalAmount.Amount;

        _invoiceRepository.GetByIdAsync(invoice.Id, Arg.Any<CancellationToken>())
            .Returns(invoice);
        _accountBalanceRepository.GetOrCreateAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(accountBalance);

        // First payment
        var firstPayment = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: 200m,
            Method: PaymentMethod.BankTransfer,
            TransactionReference: null,
            Notes: "First payment",
            RecordedBy: "finance@test.com");

        await _handler.Handle(firstPayment, CancellationToken.None);

        // Second payment
        var secondPayment = new RecordBviaPaymentCommand(
            InvoiceId: invoice.Id,
            Amount: 300m,
            Method: PaymentMethod.BankTransfer,
            TransactionReference: "TXN-67890",
            Notes: "Second payment",
            RecordedBy: "finance@test.com");

        // Act
        var result = await _handler.Handle(secondPayment, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        invoice.AmountPaid.Amount.Should().Be(500m);
        invoice.BalanceDue.Amount.Should().Be(totalAmount - 500m);
        invoice.Payments.Should().HaveCount(2);
    }

    private static BviaInvoice CreateInvoiceWithLineItems(Guid operatorId)
    {
        var invoice = BviaInvoice.Create(
            operatorId: operatorId,
            arrivalAirport: BviAirport.TUPJ,
            departureAirport: null,
            operationType: FlightOperationType.GeneralAviation,
            flightDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            aircraftRegistration: "VP-BVI",
            mtow: Weight.Kilograms(22680m),
            seatCount: 189,
            passengerCount: 50,
            fopApplicationId: Guid.NewGuid(),
            notes: "Test invoice");

        // Add line items
        invoice.AddLineItem(
            category: BviaFeeCategory.Landing,
            description: "Landing Fee",
            quantity: 1,
            quantityUnit: null,
            unitRate: Money.Usd(500m));

        invoice.AddLineItem(
            category: BviaFeeCategory.Navigation,
            description: "Navigation Fee",
            quantity: 1,
            quantityUnit: null,
            unitRate: Money.Usd(10m));

        invoice.AddLineItem(
            category: BviaFeeCategory.Security,
            description: "Passenger Service Charge",
            quantity: 50,
            quantityUnit: "passengers",
            unitRate: Money.Usd(5m));

        // Finalize the invoice so payments can be recorded
        invoice.Finalize("admin@test.com");

        return invoice;
    }
}
