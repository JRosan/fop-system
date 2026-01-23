using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FopSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Permits",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Operators",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "OperatorAccountBalances",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "FeeConfigurations",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BviaInvoices",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BviaFeeRates",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Applications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Aircraft",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subdomain = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false, defaultValue: "#1E3A5F"),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false, defaultValue: "#F4A460"),
                    ContactEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TimeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "America/Tortola"),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "USD"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId",
                table: "Users",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users",
                columns: new[] { "TenantId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_Role",
                table: "Users",
                columns: new[] { "TenantId", "Role" });

            migrationBuilder.CreateIndex(
                name: "IX_Permits_TenantId",
                table: "Permits",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Permits_TenantId_OperatorId",
                table: "Permits",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Permits_TenantId_Status",
                table: "Permits",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Operators_TenantId",
                table: "Operators",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Operators_TenantId_Name",
                table: "Operators",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OperatorAccountBalances_TenantId",
                table: "OperatorAccountBalances",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OperatorAccountBalances_TenantId_OperatorId",
                table: "OperatorAccountBalances",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_FeeConfigurations_TenantId",
                table: "FeeConfigurations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeConfigurations_TenantId_IsActive",
                table: "FeeConfigurations",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_TenantId",
                table: "BviaInvoices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_TenantId_OperatorId",
                table: "BviaInvoices",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_BviaInvoices_TenantId_Status",
                table: "BviaInvoices",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BviaFeeRates_TenantId",
                table: "BviaFeeRates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BviaFeeRates_TenantId_Category_OperationType_IsActive",
                table: "BviaFeeRates",
                columns: new[] { "TenantId", "Category", "OperationType", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId",
                table: "AuditLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "TenantId", "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId",
                table: "Applications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId_OperatorId",
                table: "Applications",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId_Status",
                table: "Applications",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Aircraft_TenantId",
                table: "Aircraft",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Aircraft_TenantId_OperatorId",
                table: "Aircraft",
                columns: new[] { "TenantId", "OperatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Code",
                table: "Tenants",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_IsActive",
                table: "Tenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Subdomain",
                table: "Tenants",
                column: "Subdomain",
                unique: true);

            // Data migration: Create default BVI tenant and migrate existing data
            migrationBuilder.Sql(@"
                -- Default BVI Tenant ID (matches TenantSeeder.DefaultBviTenantId)
                DECLARE @BviTenantId uniqueidentifier = '00000000-0000-0000-0000-000000000001';

                -- Create the default BVI tenant
                IF NOT EXISTS (SELECT 1 FROM Tenants WHERE Id = @BviTenantId)
                BEGIN
                    INSERT INTO Tenants (
                        Id, Code, Name, Subdomain, LogoUrl, PrimaryColor, SecondaryColor,
                        ContactEmail, ContactPhone, TimeZone, Currency, IsActive, CreatedAt, UpdatedAt
                    )
                    VALUES (
                        @BviTenantId, 'BVI', 'British Virgin Islands', 'bvi', NULL,
                        '#1E3A5F', '#F4A460', 'aviation@bvi.gov.vg', '+1-284-494-3701',
                        'America/Tortola', 'USD', 1, GETUTCDATE(), GETUTCDATE()
                    );
                END

                -- Migrate existing data to BVI tenant
                UPDATE Applications SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE Operators SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE Aircraft SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE Users SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE Permits SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE BviaInvoices SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE BviaFeeRates SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE OperatorAccountBalances SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE FeeConfigurations SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
                UPDATE AuditLogs SET TenantId = @BviTenantId WHERE TenantId = '00000000-0000-0000-0000-000000000000';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId_Role",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Permits_TenantId",
                table: "Permits");

            migrationBuilder.DropIndex(
                name: "IX_Permits_TenantId_OperatorId",
                table: "Permits");

            migrationBuilder.DropIndex(
                name: "IX_Permits_TenantId_Status",
                table: "Permits");

            migrationBuilder.DropIndex(
                name: "IX_Operators_TenantId",
                table: "Operators");

            migrationBuilder.DropIndex(
                name: "IX_Operators_TenantId_Name",
                table: "Operators");

            migrationBuilder.DropIndex(
                name: "IX_OperatorAccountBalances_TenantId",
                table: "OperatorAccountBalances");

            migrationBuilder.DropIndex(
                name: "IX_OperatorAccountBalances_TenantId_OperatorId",
                table: "OperatorAccountBalances");

            migrationBuilder.DropIndex(
                name: "IX_FeeConfigurations_TenantId",
                table: "FeeConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_FeeConfigurations_TenantId_IsActive",
                table: "FeeConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_BviaInvoices_TenantId",
                table: "BviaInvoices");

            migrationBuilder.DropIndex(
                name: "IX_BviaInvoices_TenantId_OperatorId",
                table: "BviaInvoices");

            migrationBuilder.DropIndex(
                name: "IX_BviaInvoices_TenantId_Status",
                table: "BviaInvoices");

            migrationBuilder.DropIndex(
                name: "IX_BviaFeeRates_TenantId",
                table: "BviaFeeRates");

            migrationBuilder.DropIndex(
                name: "IX_BviaFeeRates_TenantId_Category_OperationType_IsActive",
                table: "BviaFeeRates");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_TenantId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_TenantId_EntityType_EntityId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_Applications_TenantId",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_TenantId_OperatorId",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_TenantId_Status",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Aircraft_TenantId",
                table: "Aircraft");

            migrationBuilder.DropIndex(
                name: "IX_Aircraft_TenantId_OperatorId",
                table: "Aircraft");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Permits");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Operators");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "OperatorAccountBalances");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "FeeConfigurations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BviaInvoices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BviaFeeRates");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Aircraft");
        }
    }
}
