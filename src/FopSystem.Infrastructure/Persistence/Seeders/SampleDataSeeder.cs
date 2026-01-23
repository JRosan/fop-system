using FopSystem.Domain.Aggregates.Aircraft;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Aggregates.Operator;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.Persistence.Seeders;

public class SampleDataSeeder
{
    private readonly FopDbContext _context;
    private readonly ILogger<SampleDataSeeder> _logger;

    public SampleDataSeeder(FopDbContext context, ILogger<SampleDataSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds sample data for the specified tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID to seed data for. Defaults to the BVI tenant.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    public async Task SeedAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var targetTenantId = tenantId ?? TenantSeeder.DefaultBviTenantId;

        // Check if operators already exist for this tenant (ignore query filters for seeding)
        if (await _context.Operators
            .IgnoreQueryFilters()
            .AnyAsync(o => o.TenantId == targetTenantId, cancellationToken))
        {
            _logger.LogInformation("Sample data already seeded for tenant {TenantId}, skipping", targetTenantId);
            return;
        }

        _logger.LogInformation("Seeding sample data for tenant {TenantId}...", targetTenantId);

        var operators = CreateOperators(targetTenantId);
        await _context.Operators.AddRangeAsync(operators, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var applications = CreateApplications(operators, targetTenantId);
        await _context.Applications.AddRangeAsync(applications, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var permits = CreatePermits(applications.Where(a => a.Status == ApplicationStatus.Approved).ToList(), targetTenantId);
        await _context.Permits.AddRangeAsync(permits, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Seeded {OperatorCount} operators, {ApplicationCount} applications, {PermitCount} permits for tenant {TenantId}",
            operators.Count, applications.Count, permits.Count, targetTenantId);
    }

    private List<Operator> CreateOperators(Guid tenantId)
    {
        var operators = new List<Operator>();

        // US Operators
        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "Atlantic Charter Services",
            "AC-2024-001",
            "United States",
            Address.Create("1200 Aviation Blvd", "Miami", "United States", "FL", "33166"),
            ContactInfo.Create("ops@atlanticcharter.com", "+1-305-555-0101"),
            AuthorizedRepresentative.Create("John Smith", "Director of Operations", "john.smith@atlanticcharter.com", "+1-305-555-0102"),
            "AOC-US-45678",
            "FAA",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(2)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("N123AC", "Gulfstream", "G650", "6123", 45178, 19, 2020),
                ("N456AC", "Bombardier", "Global 7500", "70123", 48900, 17, 2022),
            }));

        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "Caribbean Sky Jets",
            "CSJ-2024-002",
            "United States",
            Address.Create("500 Executive Way", "Fort Lauderdale", "United States", "FL", "33315"),
            ContactInfo.Create("dispatch@caribbeanskyjets.com", "+1-954-555-0201"),
            AuthorizedRepresentative.Create("Maria Rodriguez", "COO", "maria@caribbeanskyjets.com", "+1-954-555-0202"),
            "AOC-US-78901",
            "FAA",
            DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(18)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("N789CS", "Cessna", "Citation Latitude", "680-0123", 14000, 9, 2021),
                ("N321CS", "Embraer", "Phenom 300E", "50500123", 8150, 8, 2023),
            }));

        // UK Operator
        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "Royal Executive Aviation",
            "REA-UK-2024",
            "United Kingdom",
            Address.Create("Hangar 7, London Luton Airport", "Luton", "United Kingdom", "Bedfordshire", "LU2 9LY"),
            ContactInfo.Create("operations@royalexecaviation.co.uk", "+44-1234-567890"),
            AuthorizedRepresentative.Create("James Wilson", "Accountable Manager", "james.wilson@royalexecaviation.co.uk", "+44-1234-567891"),
            "AOC-UK-GB-2024-123",
            "UK CAA",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("G-ROYA", "Dassault", "Falcon 8X", "408", 33113, 14, 2019),
            }));

        // Canadian Operator
        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "Northern Wings Charter",
            "NWC-CA-2024",
            "Canada",
            Address.Create("2500 Airport Road", "Toronto", "Canada", "ON", "L5P 1B2"),
            ContactInfo.Create("ops@northernwings.ca", "+1-416-555-0301"),
            AuthorizedRepresentative.Create("Michael Chen", "VP Operations", "mchen@northernwings.ca", "+1-416-555-0302"),
            "AOC-CA-2024-456",
            "Transport Canada",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(2)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("C-GNWC", "Bombardier", "Challenger 350", "20456", 18180, 10, 2022),
                ("C-FNWC", "Pilatus", "PC-24", "156", 8300, 8, 2021),
            }));

        // Caribbean Operator
        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "Island Hoppers Aviation",
            "IHA-BB-2024",
            "Barbados",
            Address.Create("Grantley Adams International Airport", "Christ Church", "Barbados"),
            ContactInfo.Create("bookings@islandhoppers.bb", "+1-246-555-0401"),
            AuthorizedRepresentative.Create("David Thompson", "Managing Director", "dthompson@islandhoppers.bb", "+1-246-555-0402"),
            "AOC-BB-2024-789",
            "Barbados Civil Aviation Authority",
            DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(20)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("8P-IHA", "Britten-Norman", "BN-2 Islander", "2145", 2994, 9, 2018),
                ("8P-HOP", "de Havilland", "DHC-6 Twin Otter", "845", 5670, 19, 2020),
            }));

        // European Operator
        operators.Add(CreateOperatorWithAircraft(
            tenantId,
            "EuroJet Executive",
            "EJE-FR-2024",
            "France",
            Address.Create("Aeroport du Bourget", "Le Bourget", "France", null, "93350"),
            ContactInfo.Create("contact@eurojetexec.fr", "+33-1-4862-0000"),
            AuthorizedRepresentative.Create("Pierre Dubois", "Directeur General", "pdubois@eurojetexec.fr", "+33-1-4862-0001"),
            "AOC-FR-EASA-2024",
            "DGAC France",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            new (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[]
            {
                ("F-HEJE", "Airbus", "ACJ319neo", "9876", 75500, 48, 2023),
            }));

        return operators;
    }

    private static Operator CreateOperatorWithAircraft(
        Guid tenantId,
        string name,
        string registrationNumber,
        string country,
        Address address,
        ContactInfo contactInfo,
        AuthorizedRepresentative authRep,
        string aocNumber,
        string aocAuthority,
        DateOnly aocExpiry,
        (string reg, string mfr, string model, string serial, decimal mtow, int seats, int year)[] aircraftData)
    {
        var op = Operator.Create(
            name,
            registrationNumber,
            country,
            address,
            contactInfo,
            authRep,
            aocNumber,
            aocAuthority,
            aocExpiry);

        op.SetTenantId(tenantId);

        foreach (var ac in aircraftData)
        {
            var aircraft = Aircraft.Create(
                ac.reg,
                ac.mfr,
                ac.model,
                ac.serial,
                AircraftCategory.FixedWing,
                Weight.Kilograms(ac.mtow),
                ac.seats,
                ac.year,
                op.Id,
                "Chapter 3");
            aircraft.SetTenantId(tenantId);
            op.AddAircraft(aircraft);
        }

        return op;
    }

    private List<FopApplication> CreateApplications(List<Operator> operators, Guid tenantId)
    {
        var applications = new List<FopApplication>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Atlantic Charter - One-Time (Approved)
        var atlantic = operators[0];
        var app1 = FopApplication.Create(
            ApplicationType.OneTime,
            atlantic.Id,
            atlantic.Aircraft.First().Id,
            FlightDetails.Create(
                FlightPurpose.Charter,
                "TUPJ", // Beef Island, BVI
                "KMIA", // Miami
                today.AddDays(14),
                numberOfPassengers: 12),
            today.AddDays(14),
            today.AddDays(14),
            Money.Usd(1150));
        app1.SetTenantId(tenantId);
        SimulateApprovedApplication(app1);
        applications.Add(app1);

        // Atlantic Charter - Blanket (Under Review)
        var app2 = FopApplication.Create(
            ApplicationType.Blanket,
            atlantic.Id,
            atlantic.Aircraft.Last().Id,
            FlightDetails.Create(
                FlightPurpose.Charter,
                "TUPJ",
                "TFFR", // Guadeloupe
                today.AddDays(7),
                numberOfPassengers: 10),
            today.AddDays(7),
            today.AddMonths(6),
            Money.Usd(2875));
        app2.SetTenantId(tenantId);
        SimulateUnderReviewApplication(app2);
        applications.Add(app2);

        // Caribbean Sky Jets - Submitted
        var caribbean = operators[1];
        var app3 = FopApplication.Create(
            ApplicationType.OneTime,
            caribbean.Id,
            caribbean.Aircraft.First().Id,
            FlightDetails.Create(
                FlightPurpose.Private,
                "TUPJ",
                "KFLL", // Fort Lauderdale
                today.AddDays(21),
                numberOfPassengers: 6),
            today.AddDays(21),
            today.AddDays(21),
            Money.Usd(950));
        app3.SetTenantId(tenantId);
        SimulateSubmittedApplication(app3);
        applications.Add(app3);

        // Royal Executive - Blanket (Approved)
        var royal = operators[2];
        var app4 = FopApplication.Create(
            ApplicationType.Blanket,
            royal.Id,
            royal.Aircraft.First().Id,
            FlightDetails.Create(
                FlightPurpose.Charter,
                "TUPJ",
                "EGSS", // London Stansted
                today.AddDays(-30),
                numberOfPassengers: 8),
            today.AddDays(-30),
            today.AddMonths(9),
            Money.Usd(3250));
        app4.SetTenantId(tenantId);
        SimulateApprovedApplication(app4);
        applications.Add(app4);

        // Northern Wings - Draft
        var northern = operators[3];
        var app5 = FopApplication.Create(
            ApplicationType.OneTime,
            northern.Id,
            northern.Aircraft.First().Id,
            FlightDetails.Create(
                FlightPurpose.TechnicalLanding,
                "TUPJ",
                "CYYZ", // Toronto
                today.AddDays(45)),
            today.AddDays(45),
            today.AddDays(45),
            Money.Usd(1100));
        app5.SetTenantId(tenantId);
        // Leave as draft
        applications.Add(app5);

        // Island Hoppers - Emergency (Approved)
        var island = operators[4];
        var app6 = FopApplication.Create(
            ApplicationType.Emergency,
            island.Id,
            island.Aircraft.Last().Id,
            FlightDetails.Create(
                FlightPurpose.Medevac,
                "TUPJ",
                "TBPB", // Barbados
                today.AddDays(-5),
                purposeDescription: "Medical evacuation - critical patient transfer",
                numberOfPassengers: 3),
            today.AddDays(-5),
            today.AddDays(-5),
            Money.Usd(575));
        app6.SetTenantId(tenantId);
        SimulateApprovedApplication(app6);
        applications.Add(app6);

        // EuroJet - Pending Payment
        var eurojet = operators[5];
        var app7 = FopApplication.Create(
            ApplicationType.Blanket,
            eurojet.Id,
            eurojet.Aircraft.First().Id,
            FlightDetails.Create(
                FlightPurpose.Charter,
                "TUPJ",
                "LFPB", // Le Bourget
                today.AddDays(30),
                numberOfPassengers: 24),
            today.AddDays(30),
            today.AddMonths(12),
            Money.Usd(4500));
        app7.SetTenantId(tenantId);
        SimulatePendingPaymentApplication(app7);
        applications.Add(app7);

        // Additional applications for variety
        // Caribbean Sky Jets - Rejected
        var app8 = FopApplication.Create(
            ApplicationType.OneTime,
            caribbean.Id,
            caribbean.Aircraft.Last().Id,
            FlightDetails.Create(
                FlightPurpose.Cargo,
                "TUPJ",
                "KFLL",
                today.AddDays(-10),
                cargoDescription: "General cargo - consumer goods"),
            today.AddDays(-10),
            today.AddDays(-10),
            Money.Usd(850));
        app8.SetTenantId(tenantId);
        SimulateRejectedApplication(app8, "Insurance certificate expired. Please resubmit with valid insurance.");
        applications.Add(app8);

        // Northern Wings - Pending Documents
        var app9 = FopApplication.Create(
            ApplicationType.OneTime,
            northern.Id,
            northern.Aircraft.Last().Id,
            FlightDetails.Create(
                FlightPurpose.Charter,
                "TUPJ",
                "CYYZ",
                today.AddDays(60),
                numberOfPassengers: 6),
            today.AddDays(60),
            today.AddDays(60),
            Money.Usd(900));
        app9.SetTenantId(tenantId);
        SimulatePendingDocumentsApplication(app9);
        applications.Add(app9);

        return applications;
    }

    private static void SimulateSubmittedApplication(FopApplication app)
    {
        AddRequiredDocuments(app);
        app.Submit();
    }

    private static void SimulateUnderReviewApplication(FopApplication app)
    {
        AddRequiredDocuments(app);
        app.Submit();
        app.StartReview("reviewer@bvicaa.vg");
        VerifyAllDocuments(app);
        app.RequestPayment(PaymentMethod.CreditCard);
        app.CompletePayment($"TXN-{Guid.NewGuid():N}"[..20], $"RCP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..16]);
        // Ready for final approval
    }

    private static void SimulatePendingDocumentsApplication(FopApplication app)
    {
        // Add only some documents
        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.CertificateOfAirworthiness, "coa.pdf", 125000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/coa.pdf", "applicant@example.com",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1))));
        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.CertificateOfRegistration, "cor.pdf", 98000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/cor.pdf", "applicant@example.com",
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(2))));
        // Missing AOC and Insurance - simulate pending documents state
    }

    private static void SimulatePendingPaymentApplication(FopApplication app)
    {
        AddRequiredDocuments(app);
        app.Submit();
        app.StartReview("reviewer@bvicaa.vg");
        VerifyAllDocuments(app);
        app.RequestPayment(PaymentMethod.BankTransfer);
        app.CompletePayment($"TXN-{Guid.NewGuid():N}"[..20], $"RCP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..16]);
        // Ready for final approval
    }

    private static void SimulateApprovedApplication(FopApplication app)
    {
        AddRequiredDocuments(app);
        app.Submit();
        app.StartReview("reviewer@bvicaa.vg");
        VerifyAllDocuments(app);
        app.RequestPayment(PaymentMethod.CreditCard);
        app.CompletePayment($"TXN-{Guid.NewGuid():N}"[..20], $"RCP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..16]);
        app.Approve("approver@bvicaa.vg", "All documents verified. Payment confirmed.");
    }

    private static void SimulateRejectedApplication(FopApplication app, string reason)
    {
        AddRequiredDocuments(app);
        app.Submit();
        app.StartReview("reviewer@bvicaa.vg");
        app.Reject("reviewer@bvicaa.vg", reason);
    }

    private static void AddRequiredDocuments(FopApplication app)
    {
        var expiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1));

        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.CertificateOfAirworthiness, "certificate_of_airworthiness.pdf", 125000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/coa.pdf", "applicant@example.com", expiryDate));

        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.CertificateOfRegistration, "certificate_of_registration.pdf", 98000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/cor.pdf", "applicant@example.com", expiryDate.AddYears(1)));

        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.AirOperatorCertificate, "air_operator_certificate.pdf", 256000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/aoc.pdf", "applicant@example.com", expiryDate));

        app.AddDocument(ApplicationDocument.Create(
            app.Id, DocumentType.InsuranceCertificate, "insurance_certificate.pdf", 189000, "application/pdf",
            $"https://storage.example.com/{Guid.NewGuid()}/insurance.pdf", "applicant@example.com", expiryDate));
    }

    private static void VerifyAllDocuments(FopApplication app)
    {
        foreach (var doc in app.Documents)
        {
            app.VerifyDocument(doc.Id, "reviewer@bvicaa.vg");
        }
    }

    private List<Permit> CreatePermits(List<FopApplication> approvedApplications, Guid tenantId)
    {
        var permits = new List<Permit>();

        foreach (var app in approvedApplications)
        {
            var permit = Permit.Issue(
                app.Id,
                app.ApplicationNumber,
                app.Type,
                app.OperatorId,
                app.Operator?.Name ?? "Unknown Operator",
                app.AircraftId,
                app.Aircraft?.RegistrationMark ?? "Unknown",
                app.RequestedStartDate,
                app.RequestedEndDate,
                app.CalculatedFee,
                "approver@bvicaa.vg",
                new[] { "Flight operations must comply with all BVI aviation regulations", "24-hour notice required for flight plan submission" });

            permit.SetTenantId(tenantId);
            permit.SetDocumentUrl($"https://storage.example.com/permits/{permit.PermitNumber}.pdf");
            permits.Add(permit);
        }

        return permits;
    }
}
