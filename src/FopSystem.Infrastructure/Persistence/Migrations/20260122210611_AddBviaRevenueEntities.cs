using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FopSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBviaRevenueEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BviaFeeRates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OperationType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Airport = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MtowTier = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RateAmount = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    RateCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    IsPerUnit = table.Column<bool>(type: "bit", nullable: false),
                    UnitDescription = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MinimumFeeAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MinimumFeeCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BviaFeeRates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BviaInvoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FopApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ArrivalAirport = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartureAirport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OperationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlightDate = table.Column<DateOnly>(type: "date", nullable: false),
                    AircraftRegistration = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MtowValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MtowUnit = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SeatCount = table.Column<int>(type: "int", nullable: false),
                    PassengerCount = table.Column<int>(type: "int", nullable: true),
                    SubtotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SubtotalCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalInterestAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalInterestCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    AmountPaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountPaidCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    BalanceDueAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BalanceDueCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    InvoiceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    FinalizedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalizedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MarkedOverdueAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BviaInvoices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperatorAccountBalances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalInvoicedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalInvoicedCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalPaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPaidCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalInterestAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalInterestCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CurrentBalanceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentBalanceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalOverdueAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalOverdueCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    InvoiceCount = table.Column<int>(type: "int", nullable: false),
                    PaidInvoiceCount = table.Column<int>(type: "int", nullable: false),
                    OverdueInvoiceCount = table.Column<int>(type: "int", nullable: false),
                    LastInvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperatorAccountBalances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BviaInvoiceLineItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    QuantityUnit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UnitRateAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitRateCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    FeeRateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsInterestCharge = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BviaInvoiceLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BviaInvoiceLineItems_BviaInvoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "BviaInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BviaPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Method = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReceiptNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RecordedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BviaPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BviaPayments_BviaInvoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "BviaInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BviaFeeRates_Category_OperationType_Airport_MtowTier_EffectiveFrom",
                table: "BviaFeeRates",
                columns: new[] { "Category", "OperationType", "Airport", "MtowTier", "EffectiveFrom" });

            migrationBuilder.CreateIndex(
                name: "IX_BviaFeeRates_IsActive",
                table: "BviaFeeRates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoiceLineItems_InvoiceId",
                table: "BviaInvoiceLineItems",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_DueDate",
                table: "BviaInvoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_FopApplicationId",
                table: "BviaInvoices",
                column: "FopApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_InvoiceNumber",
                table: "BviaInvoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_OperatorId",
                table: "BviaInvoices",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_Status",
                table: "BviaInvoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BviaPayments_InvoiceId",
                table: "BviaPayments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_OperatorAccountBalances_OperatorId",
                table: "OperatorAccountBalances",
                column: "OperatorId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BviaFeeRates");

            migrationBuilder.DropTable(
                name: "BviaInvoiceLineItems");

            migrationBuilder.DropTable(
                name: "BviaPayments");

            migrationBuilder.DropTable(
                name: "OperatorAccountBalances");

            migrationBuilder.DropTable(
                name: "BviaInvoices");
        }
    }
}
