-- BVI FOP System - Seed Data Script
-- This script populates the database with initial reference data

USE FopDb;
GO

-- =============================================
-- Fee Configuration
-- =============================================
PRINT 'Inserting fee configuration...';

IF NOT EXISTS (SELECT 1 FROM FeeConfiguration WHERE Id = '00000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO FeeConfiguration (Id, BaseFee, BaseFee_Currency, PerSeatFee, PerSeatFee_Currency, PerKgFee, PerKgFee_Currency, OneTimeMultiplier, BlanketMultiplier, EmergencyMultiplier, EffectiveFrom, CreatedAt, UpdatedAt)
    VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        500.00, 'USD',
        10.00, 'USD',
        0.05, 'USD',
        1.0,  -- One-Time multiplier
        2.5,  -- Blanket multiplier
        0.5,  -- Emergency multiplier
        '2024-01-01',
        GETUTCDATE(),
        GETUTCDATE()
    );
    PRINT 'Fee configuration inserted.';
END
ELSE
BEGIN
    PRINT 'Fee configuration already exists.';
END
GO

-- =============================================
-- Document Types
-- =============================================
PRINT 'Inserting document types...';

IF NOT EXISTS (SELECT 1 FROM DocumentTypes WHERE Code = 'AOC')
BEGIN
    INSERT INTO DocumentTypes (Id, Code, Name, Description, IsRequired, ValidityPeriodMonths, CreatedAt)
    VALUES
    ('00000000-0000-0000-0000-000000000010', 'AOC', 'Air Operator Certificate', 'Certificate issued by the state of the operator', 1, 12, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000011', 'COA', 'Certificate of Airworthiness', 'Document certifying aircraft airworthiness', 1, 12, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000012', 'INS', 'Insurance Certificate', 'Third-party liability insurance', 1, 12, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000013', 'REG', 'Aircraft Registration', 'Certificate of aircraft registration', 1, NULL, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000014', 'NOISE', 'Noise Certificate', 'Aircraft noise compliance certificate', 0, NULL, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000015', 'RADIO', 'Radio License', 'Aircraft radio station license', 0, 12, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000016', 'CREW', 'Crew Licenses', 'Flight crew licenses and medical certificates', 1, NULL, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000017', 'OPS_SPEC', 'Operations Specifications', 'Operator operations specifications', 0, NULL, GETUTCDATE());
    PRINT 'Document types inserted.';
END
ELSE
BEGIN
    PRINT 'Document types already exist.';
END
GO

-- =============================================
-- Flight Purposes
-- =============================================
PRINT 'Inserting flight purposes...';

IF NOT EXISTS (SELECT 1 FROM FlightPurposes WHERE Code = 'CHARTER')
BEGIN
    INSERT INTO FlightPurposes (Id, Code, Name, Description, RequiresAdditionalApproval, CreatedAt)
    VALUES
    ('00000000-0000-0000-0000-000000000020', 'CHARTER', 'Charter Flight', 'Commercial charter passenger operations', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000021', 'CARGO', 'Cargo Operations', 'Commercial cargo transportation', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000022', 'MEDICAL', 'Medical Evacuation', 'Emergency medical evacuation flights', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000023', 'HUMANITARIAN', 'Humanitarian', 'Humanitarian aid and relief operations', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000024', 'TECH_STOP', 'Technical Stop', 'Technical or fuel stops only', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000025', 'TRAINING', 'Training Flight', 'Flight crew training operations', 1, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000026', 'FERRY', 'Ferry Flight', 'Non-revenue positioning flight', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000027', 'TEST', 'Test Flight', 'Aircraft test and demonstration flights', 1, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000028', 'PRIVATE', 'Private Flight', 'Non-commercial private operations', 0, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000029', 'GOVERNMENT', 'Government', 'Government or state aircraft operations', 1, GETUTCDATE());
    PRINT 'Flight purposes inserted.';
END
ELSE
BEGIN
    PRINT 'Flight purposes already exist.';
END
GO

-- =============================================
-- BVI Airports
-- =============================================
PRINT 'Inserting BVI airports...';

IF NOT EXISTS (SELECT 1 FROM Airports WHERE IcaoCode = 'TUPJ')
BEGIN
    INSERT INTO Airports (Id, IcaoCode, IataCode, Name, City, Country, IsInternational, IsBVI, Latitude, Longitude, CreatedAt)
    VALUES
    ('00000000-0000-0000-0000-000000000030', 'TUPJ', 'EIS', 'Terrance B. Lettsome International Airport', 'Beef Island', 'British Virgin Islands', 1, 1, 18.4448, -64.5433, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000031', 'TUPW', 'VIJ', 'Virgin Gorda Airport', 'Virgin Gorda', 'British Virgin Islands', 0, 1, 18.4464, -64.4275, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000032', 'TUPA', 'NGD', 'Captain Auguste George Airport', 'Anegada', 'British Virgin Islands', 0, 1, 18.7272, -64.3297, GETUTCDATE());
    PRINT 'BVI airports inserted.';
END
ELSE
BEGIN
    PRINT 'BVI airports already exist.';
END
GO

-- =============================================
-- Common Caribbean Airports
-- =============================================
PRINT 'Inserting common Caribbean airports...';

IF NOT EXISTS (SELECT 1 FROM Airports WHERE IcaoCode = 'TNCM')
BEGIN
    INSERT INTO Airports (Id, IcaoCode, IataCode, Name, City, Country, IsInternational, IsBVI, Latitude, Longitude, CreatedAt)
    VALUES
    ('00000000-0000-0000-0000-000000000040', 'TNCM', 'SXM', 'Princess Juliana International Airport', 'Sint Maarten', 'Sint Maarten', 1, 0, 18.0410, -63.1089, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000041', 'TJSJ', 'SJU', 'Luis Munoz Marin International Airport', 'San Juan', 'Puerto Rico', 1, 0, 18.4394, -66.0018, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000042', 'TIST', 'STT', 'Cyril E. King Airport', 'St. Thomas', 'US Virgin Islands', 1, 0, 18.3373, -64.9734, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000043', 'TISX', 'STX', 'Henry E. Rohlsen Airport', 'St. Croix', 'US Virgin Islands', 1, 0, 17.7019, -64.7986, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000044', 'TAPA', 'ANU', 'V.C. Bird International Airport', 'Antigua', 'Antigua and Barbuda', 1, 0, 17.1367, -61.7926, GETUTCDATE()),
    ('00000000-0000-0000-0000-000000000045', 'TBPB', 'BGI', 'Grantley Adams International Airport', 'Bridgetown', 'Barbados', 1, 0, 13.0746, -59.4925, GETUTCDATE());
    PRINT 'Caribbean airports inserted.';
END
ELSE
BEGIN
    PRINT 'Caribbean airports already exist.';
END
GO

-- =============================================
-- System Users (for audit purposes)
-- =============================================
PRINT 'Inserting system users...';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'system@bvicad.vg')
BEGIN
    INSERT INTO Users (Id, Email, FirstName, LastName, Role, IsActive, CreatedAt, UpdatedAt)
    VALUES
    ('00000000-0000-0000-0000-000000000099', 'system@bvicad.vg', 'System', 'Account', 'Admin', 1, GETUTCDATE(), GETUTCDATE());
    PRINT 'System user inserted.';
END
ELSE
BEGIN
    PRINT 'System user already exists.';
END
GO

PRINT '';
PRINT '==========================================';
PRINT 'Seed data script completed successfully!';
PRINT '==========================================';
GO
