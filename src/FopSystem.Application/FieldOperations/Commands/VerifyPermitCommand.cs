using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Aggregates.Field;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.FieldOperations.Commands;

public sealed record VerifyPermitCommand(
    string QrContent,
    Guid OfficerId,
    string OfficerName,
    double? Latitude,
    double? Longitude,
    double? Accuracy,
    BviAirport? Airport,
    string? DeviceId,
    int ScanDurationMs = 0) : ICommand<VerifyPermitResponse>;

public sealed class VerifyPermitCommandValidator : AbstractValidator<VerifyPermitCommand>
{
    public VerifyPermitCommandValidator()
    {
        RuleFor(x => x.QrContent).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.OfficerId).NotEmpty();
        RuleFor(x => x.OfficerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DeviceId).MaximumLength(100);

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue);

        RuleFor(x => x.ScanDurationMs)
            .GreaterThanOrEqualTo(0);
    }
}

public sealed class VerifyPermitCommandHandler : ICommandHandler<VerifyPermitCommand, VerifyPermitResponse>
{
    private readonly IJwtPermitTokenService _tokenService;
    private readonly IPermitRepository _permitRepository;
    private readonly IFieldVerificationLogRepository _verificationLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyPermitCommandHandler(
        IJwtPermitTokenService tokenService,
        IPermitRepository permitRepository,
        IFieldVerificationLogRepository verificationLogRepository,
        IUnitOfWork unitOfWork)
    {
        _tokenService = tokenService;
        _permitRepository = permitRepository;
        _verificationLogRepository = verificationLogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<VerifyPermitResponse>> Handle(
        VerifyPermitCommand request,
        CancellationToken cancellationToken)
    {
        // Create location if coordinates provided
        GeoCoordinate? location = null;
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            location = GeoCoordinate.Create(
                request.Latitude.Value,
                request.Longitude.Value,
                accuracy: request.Accuracy);
        }

        // Try to validate the token from QR content
        var validationResult = await _tokenService.ValidateTokenAsync(request.QrContent);

        FieldVerificationLog verificationLog;
        VerifyPermitResponse response;

        if (validationResult.IsValid && validationResult.Claims != null)
        {
            var claims = validationResult.Claims;

            // Get the latest permit status from database
            var permit = await _permitRepository.GetByIdAsync(claims.PermitId, cancellationToken);
            var currentStatus = permit?.Status ?? claims.Status;
            var isExpired = permit?.IsExpired(DateOnly.FromDateTime(DateTime.UtcNow)) ??
                           claims.ValidUntil < DateOnly.FromDateTime(DateTime.UtcNow);

            VerificationResult finalResult;
            string? failureReason = null;

            if (permit == null)
            {
                finalResult = VerificationResult.NotFound;
                failureReason = "Permit not found in database";
            }
            else if (currentStatus == PermitStatus.Revoked)
            {
                finalResult = VerificationResult.Revoked;
                failureReason = "Permit has been revoked";
            }
            else if (currentStatus == PermitStatus.Suspended)
            {
                finalResult = VerificationResult.Suspended;
                failureReason = "Permit is suspended";
            }
            else if (isExpired)
            {
                finalResult = VerificationResult.Expired;
                failureReason = $"Permit expired on {claims.ValidUntil:yyyy-MM-dd}";
            }
            else
            {
                finalResult = VerificationResult.Valid;
            }

            // Log the verification
            if (finalResult == VerificationResult.Valid && permit != null)
            {
                verificationLog = FieldVerificationLog.RecordSuccessfulVerification(
                    permitId: permit.Id,
                    permitNumber: permit.PermitNumber,
                    operatorId: permit.OperatorId,
                    operatorName: permit.OperatorName,
                    aircraftRegistration: permit.AircraftRegistration,
                    officerId: request.OfficerId,
                    officerName: request.OfficerName,
                    scanDurationMs: request.ScanDurationMs,
                    location: location,
                    airport: request.Airport,
                    deviceId: request.DeviceId);

                var daysUntilExpiry = permit.DaysUntilExpiry(DateOnly.FromDateTime(DateTime.UtcNow));

                response = new VerifyPermitResponse(
                    IsValid: true,
                    Result: VerificationResult.Valid,
                    FailureReason: null,
                    PermitDetails: new PermitVerificationDetailsDto(
                        PermitId: permit.Id,
                        PermitNumber: permit.PermitNumber,
                        OperatorName: permit.OperatorName,
                        AircraftRegistration: permit.AircraftRegistration,
                        ValidFrom: permit.ValidFrom,
                        ValidUntil: permit.ValidUntil,
                        Status: permit.Status,
                        DaysUntilExpiry: daysUntilExpiry));
            }
            else
            {
                verificationLog = FieldVerificationLog.RecordFailedVerification(
                    scannedPermitNumber: claims.PermitNumber,
                    result: finalResult,
                    failureReason: failureReason!,
                    officerId: request.OfficerId,
                    officerName: request.OfficerName,
                    scanDurationMs: request.ScanDurationMs,
                    location: location,
                    airport: request.Airport,
                    deviceId: request.DeviceId,
                    rawQrContent: request.QrContent);

                response = new VerifyPermitResponse(
                    IsValid: false,
                    Result: finalResult,
                    FailureReason: failureReason,
                    PermitDetails: null);
            }
        }
        else
        {
            // Token validation failed
            verificationLog = FieldVerificationLog.RecordFailedVerification(
                scannedPermitNumber: "INVALID",
                result: validationResult.Result,
                failureReason: validationResult.FailureReason ?? "Token validation failed",
                officerId: request.OfficerId,
                officerName: request.OfficerName,
                scanDurationMs: request.ScanDurationMs,
                location: location,
                airport: request.Airport,
                deviceId: request.DeviceId,
                rawQrContent: request.QrContent);

            response = new VerifyPermitResponse(
                IsValid: false,
                Result: validationResult.Result,
                FailureReason: validationResult.FailureReason,
                PermitDetails: null);
        }

        await _verificationLogRepository.AddAsync(verificationLog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(response);
    }
}
