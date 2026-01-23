using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FopSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerificationTokenExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AirportServiceLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PermitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PermitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AircraftRegistration = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OfficerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OfficerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ServiceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FeeAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FeeCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    QuantityUnit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UnitRateAmount = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitRateCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    LocationLatitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationLongitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationAltitude = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    LocationAccuracy = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    Airport = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LoggedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InvoicedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WasOfflineLog = table.Column<bool>(type: "bit", nullable: false),
                    SyncedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AirportServiceLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeviceTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Platform = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceTokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FieldVerificationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ScannedPermitNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PermitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OperatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OperatorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AircraftRegistration = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OfficerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OfficerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Result = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LocationLatitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationLongitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationAltitude = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    LocationAccuracy = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    Airport = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScanDurationMs = table.Column<int>(type: "int", nullable: false),
                    WasOfflineVerification = table.Column<bool>(type: "bit", nullable: false),
                    SyncedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RawQrContent = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                    JwtTokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldVerificationLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentIntents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StripePaymentIntentId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    StripeCheckoutSessionId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StripeCustomerId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StripeSubscriptionId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentIntents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TelemetryEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeviceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LocationLatitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationLongitude = table.Column<double>(type: "float(10)", precision: 10, scale: 6, nullable: true),
                    LocationAltitude = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    LocationAccuracy = table.Column<double>(type: "float(10)", precision: 10, scale: 2, nullable: true),
                    Airport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionLatencyMs = table.Column<int>(type: "int", nullable: true),
                    JsonPayload = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: true),
                    AppVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Platform = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OsVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NetworkType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PermitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ServiceLogId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VerificationLogId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TelemetryEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_InvoiceId",
                table: "AirportServiceLogs",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_LogNumber",
                table: "AirportServiceLogs",
                column: "LogNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_OfficerId",
                table: "AirportServiceLogs",
                column: "OfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_OperatorId",
                table: "AirportServiceLogs",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_PermitId",
                table: "AirportServiceLogs",
                column: "PermitId");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_Status",
                table: "AirportServiceLogs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_TenantId",
                table: "AirportServiceLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_TenantId_OfficerId_LoggedAt",
                table: "AirportServiceLogs",
                columns: new[] { "TenantId", "OfficerId", "LoggedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_TenantId_OperatorId",
                table: "AirportServiceLogs",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_AirportServiceLogs_TenantId_Status",
                table: "AirportServiceLogs",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_TenantId",
                table: "DeviceTokens",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_Token",
                table: "DeviceTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserId",
                table: "DeviceTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserId_IsActive",
                table: "DeviceTokens",
                columns: new[] { "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_Airport",
                table: "FieldVerificationLogs",
                column: "Airport");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_OfficerId",
                table: "FieldVerificationLogs",
                column: "OfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_OperatorId",
                table: "FieldVerificationLogs",
                column: "OperatorId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_PermitId",
                table: "FieldVerificationLogs",
                column: "PermitId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_Result",
                table: "FieldVerificationLogs",
                column: "Result");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_TenantId",
                table: "FieldVerificationLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_TenantId_OfficerId_VerifiedAt",
                table: "FieldVerificationLogs",
                columns: new[] { "TenantId", "OfficerId", "VerifiedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_TenantId_Result",
                table: "FieldVerificationLogs",
                columns: new[] { "TenantId", "Result" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldVerificationLogs_TenantId_VerifiedAt",
                table: "FieldVerificationLogs",
                columns: new[] { "TenantId", "VerifiedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_CreatedAt",
                table: "PaymentIntents",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_Status",
                table: "PaymentIntents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_StripeCheckoutSessionId",
                table: "PaymentIntents",
                column: "StripeCheckoutSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_StripeCustomerId",
                table: "PaymentIntents",
                column: "StripeCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_StripePaymentIntentId",
                table: "PaymentIntents",
                column: "StripePaymentIntentId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_StripeSubscriptionId",
                table: "PaymentIntents",
                column: "StripeSubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentIntents_TenantId",
                table: "PaymentIntents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_DeviceId",
                table: "TelemetryEvents",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_EventType",
                table: "TelemetryEvents",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_OccurredAt",
                table: "TelemetryEvents",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_TenantId",
                table: "TelemetryEvents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_TenantId_DeviceId_OccurredAt",
                table: "TelemetryEvents",
                columns: new[] { "TenantId", "DeviceId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_TenantId_EventType_OccurredAt",
                table: "TelemetryEvents",
                columns: new[] { "TenantId", "EventType", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_TenantId_UserId_OccurredAt",
                table: "TelemetryEvents",
                columns: new[] { "TenantId", "UserId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryEvents_UserId",
                table: "TelemetryEvents",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AirportServiceLogs");

            migrationBuilder.DropTable(
                name: "DeviceTokens");

            migrationBuilder.DropTable(
                name: "FieldVerificationLogs");

            migrationBuilder.DropTable(
                name: "PaymentIntents");

            migrationBuilder.DropTable(
                name: "TelemetryEvents");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "Users");
        }
    }
}
