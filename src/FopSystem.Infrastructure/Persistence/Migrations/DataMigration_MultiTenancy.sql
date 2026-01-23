-- Data Migration Script: Multi-Tenancy
-- This script migrates existing data to the default BVI tenant
-- Run this AFTER the schema migration (AddMultiTenancy)

-- Default BVI Tenant ID (matches TenantSeeder.DefaultBviTenantId)
DECLARE @BviTenantId uniqueidentifier = '00000000-0000-0000-0000-000000000001';

-- 1. Create the default BVI tenant (if it doesn't exist)
IF NOT EXISTS (SELECT 1 FROM Tenants WHERE Id = @BviTenantId)
BEGIN
    INSERT INTO Tenants (
        Id,
        Code,
        Name,
        Subdomain,
        LogoUrl,
        PrimaryColor,
        SecondaryColor,
        ContactEmail,
        ContactPhone,
        TimeZone,
        Currency,
        IsActive,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        @BviTenantId,
        'BVI',
        'British Virgin Islands',
        'bvi',
        NULL,
        '#1E3A5F',
        '#F4A460',
        'aviation@bvi.gov.vg',
        '+1-284-494-3701',
        'America/Tortola',
        'USD',
        1,
        GETUTCDATE(),
        GETUTCDATE()
    );
    PRINT 'Created default BVI tenant';
END
ELSE
BEGIN
    PRINT 'Default BVI tenant already exists';
END

-- 2. Migrate existing data to BVI tenant
-- Only update records that have empty/default GUID for TenantId

PRINT 'Migrating Applications...';
UPDATE Applications
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' Applications');

PRINT 'Migrating Operators...';
UPDATE Operators
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' Operators');

PRINT 'Migrating Aircraft...';
UPDATE Aircraft
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' Aircraft');

PRINT 'Migrating Users...';
UPDATE Users
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' Users');

PRINT 'Migrating Permits...';
UPDATE Permits
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' Permits');

PRINT 'Migrating BviaInvoices...';
UPDATE BviaInvoices
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' BviaInvoices');

PRINT 'Migrating BviaFeeRates...';
UPDATE BviaFeeRates
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' BviaFeeRates');

PRINT 'Migrating OperatorAccountBalances...';
UPDATE OperatorAccountBalances
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' OperatorAccountBalances');

PRINT 'Migrating FeeConfigurations...';
UPDATE FeeConfigurations
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' FeeConfigurations');

PRINT 'Migrating AuditLogs...';
UPDATE AuditLogs
SET TenantId = @BviTenantId
WHERE TenantId = '00000000-0000-0000-0000-000000000000';
PRINT CONCAT('Updated ', @@ROWCOUNT, ' AuditLogs');

PRINT 'Data migration complete!';

-- 3. Verification queries (optional - can be removed in production)
PRINT '';
PRINT '=== Verification ===';
PRINT CONCAT('Tenants: ', (SELECT COUNT(*) FROM Tenants));
PRINT CONCAT('Applications with BVI tenant: ', (SELECT COUNT(*) FROM Applications WHERE TenantId = @BviTenantId));
PRINT CONCAT('Operators with BVI tenant: ', (SELECT COUNT(*) FROM Operators WHERE TenantId = @BviTenantId));
PRINT CONCAT('Aircraft with BVI tenant: ', (SELECT COUNT(*) FROM Aircraft WHERE TenantId = @BviTenantId));
PRINT CONCAT('Users with BVI tenant: ', (SELECT COUNT(*) FROM Users WHERE TenantId = @BviTenantId));
