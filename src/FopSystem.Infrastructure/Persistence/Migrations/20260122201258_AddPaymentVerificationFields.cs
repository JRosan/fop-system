using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FopSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentVerificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeeConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BaseFeeUsd = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    PerSeatFeeUsd = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    PerKgFeeUsd = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    OneTimeMultiplier = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    BlanketMultiplier = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    EmergencyMultiplier = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Operators",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TradingName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RegistrationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AddressStreet = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AddressCity = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AddressState = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AddressPostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AddressCountry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContactFax = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AuthRepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AuthRepTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AuthRepEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AuthRepPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AocNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AocIssuingAuthority = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AocExpiryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operators", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OperatorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AircraftId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AircraftRegistration = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ValidFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    ValidUntil = table.Column<DateOnly>(type: "date", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IssuedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FeesPaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FeesPaidCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    DocumentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Conditions = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    RevocationReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SuspensionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SuspendedUntil = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AzureAdObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Aircraft",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistrationMark = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Manufacturer = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SerialNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MtowValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MtowUnit = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    SeatCount = table.Column<int>(type: "int", nullable: false),
                    YearOfManufacture = table.Column<int>(type: "int", nullable: false),
                    NoiseCategory = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aircraft", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aircraft_Operators_OperatorId",
                        column: x => x.OperatorId,
                        principalTable: "Operators",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AircraftId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FlightPurpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlightPurposeDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ArrivalAirport = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DepartureAirport = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    EstimatedFlightDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NumberOfPassengers = table.Column<int>(type: "int", nullable: true),
                    CargoDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequestedStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    RequestedEndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CalculatedFeeAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CalculatedFeeCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReviewNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FeeOverrideJustification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeeOverriddenBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeeOverriddenAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsFlagged = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FlagReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FlaggedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FlaggedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Aircraft_AircraftId",
                        column: x => x.AircraftId,
                        principalTable: "Aircraft",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applications_Operators_OperatorId",
                        column: x => x.OperatorId,
                        principalTable: "Operators",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BlobUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationDocuments_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Method = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReceiptNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReceiptUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    VerifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerificationNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationPayments_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeeWaivers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RequestedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WaivedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    WaivedCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    WaiverPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeWaivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeWaivers_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aircraft_OperatorId",
                table: "Aircraft",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Aircraft_RegistrationMark",
                table: "Aircraft",
                column: "RegistrationMark",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationDocuments_ApplicationId",
                table: "ApplicationDocuments",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationDocuments_ApplicationId_Type",
                table: "ApplicationDocuments",
                columns: new[] { "ApplicationId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPayments_ApplicationId",
                table: "ApplicationPayments",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPayments_IsVerified",
                table: "ApplicationPayments",
                column: "IsVerified");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPayments_Status",
                table: "ApplicationPayments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_AircraftId",
                table: "Applications",
                column: "AircraftId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ApplicationNumber",
                table: "Applications",
                column: "ApplicationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_IsFlagged",
                table: "Applications",
                column: "IsFlagged");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_OperatorId",
                table: "Applications",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Status",
                table: "Applications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_SubmittedAt",
                table: "Applications",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Action",
                table: "AuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityId",
                table: "AuditLogs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType",
                table: "AuditLogs",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeConfigurations_EffectiveFrom",
                table: "FeeConfigurations",
                column: "EffectiveFrom");

            migrationBuilder.CreateIndex(
                name: "IX_FeeConfigurations_EffectiveTo",
                table: "FeeConfigurations",
                column: "EffectiveTo");

            migrationBuilder.CreateIndex(
                name: "IX_FeeConfigurations_IsActive",
                table: "FeeConfigurations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_FeeWaivers_ApplicationId",
                table: "FeeWaivers",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeWaivers_Status",
                table: "FeeWaivers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Operators_AocExpiryDate",
                table: "Operators",
                column: "AocExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_Operators_Country",
                table: "Operators",
                column: "Country");

            migrationBuilder.CreateIndex(
                name: "IX_Operators_RegistrationNumber",
                table: "Operators",
                column: "RegistrationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permits_ApplicationId",
                table: "Permits",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Permits_OperatorId",
                table: "Permits",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Permits_PermitNumber",
                table: "Permits",
                column: "PermitNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permits_Status",
                table: "Permits",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Permits_ValidUntil",
                table: "Permits",
                column: "ValidUntil");

            migrationBuilder.CreateIndex(
                name: "IX_Users_AzureAdObjectId",
                table: "Users",
                column: "AzureAdObjectId",
                unique: true,
                filter: "[AzureAdObjectId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationDocuments");

            migrationBuilder.DropTable(
                name: "ApplicationPayments");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "FeeConfigurations");

            migrationBuilder.DropTable(
                name: "FeeWaivers");

            migrationBuilder.DropTable(
                name: "Permits");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "Aircraft");

            migrationBuilder.DropTable(
                name: "Operators");
        }
    }
}
