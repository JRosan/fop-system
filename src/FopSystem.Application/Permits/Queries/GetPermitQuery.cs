using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Permits.Queries;

public sealed record GetPermitQuery(Guid PermitId) : IQuery<PermitDto>;

public sealed record GetPermitByNumberQuery(string PermitNumber) : IQuery<PermitDto>;

public sealed record VerifyPermitQuery(string PermitNumber) : IQuery<PermitVerificationDto>;

public sealed class GetPermitQueryHandler : IQueryHandler<GetPermitQuery, PermitDto>
{
    private readonly IPermitRepository _permitRepository;

    public GetPermitQueryHandler(IPermitRepository permitRepository)
    {
        _permitRepository = permitRepository;
    }

    public async Task<Result<PermitDto>> Handle(GetPermitQuery request, CancellationToken cancellationToken)
    {
        var permit = await _permitRepository.GetByIdAsync(request.PermitId, cancellationToken);
        if (permit is null)
        {
            return Result.Failure<PermitDto>(Error.NotFound);
        }

        return Result.Success(MapToDto(permit));
    }

    private static PermitDto MapToDto(Domain.Aggregates.Permit.Permit permit)
    {
        return new PermitDto(
            permit.Id,
            permit.PermitNumber,
            permit.ApplicationId,
            permit.ApplicationNumber,
            permit.Type,
            permit.Status,
            permit.OperatorId,
            permit.OperatorName,
            permit.AircraftId,
            permit.AircraftRegistration,
            permit.ValidFrom,
            permit.ValidUntil,
            permit.IssuedAt,
            permit.IssuedBy,
            permit.Conditions.ToList(),
            new MoneyDto(permit.FeesPaid.Amount, permit.FeesPaid.Currency.ToString()),
            permit.DocumentUrl,
            permit.CreatedAt,
            permit.UpdatedAt);
    }
}

public sealed class GetPermitByNumberQueryHandler : IQueryHandler<GetPermitByNumberQuery, PermitDto>
{
    private readonly IPermitRepository _permitRepository;

    public GetPermitByNumberQueryHandler(IPermitRepository permitRepository)
    {
        _permitRepository = permitRepository;
    }

    public async Task<Result<PermitDto>> Handle(GetPermitByNumberQuery request, CancellationToken cancellationToken)
    {
        var permit = await _permitRepository.GetByPermitNumberAsync(request.PermitNumber, cancellationToken);
        if (permit is null)
        {
            return Result.Failure<PermitDto>(Error.NotFound);
        }

        return Result.Success(new PermitDto(
            permit.Id,
            permit.PermitNumber,
            permit.ApplicationId,
            permit.ApplicationNumber,
            permit.Type,
            permit.Status,
            permit.OperatorId,
            permit.OperatorName,
            permit.AircraftId,
            permit.AircraftRegistration,
            permit.ValidFrom,
            permit.ValidUntil,
            permit.IssuedAt,
            permit.IssuedBy,
            permit.Conditions.ToList(),
            new MoneyDto(permit.FeesPaid.Amount, permit.FeesPaid.Currency.ToString()),
            permit.DocumentUrl,
            permit.CreatedAt,
            permit.UpdatedAt));
    }
}

public sealed class VerifyPermitQueryHandler : IQueryHandler<VerifyPermitQuery, PermitVerificationDto>
{
    private readonly IPermitRepository _permitRepository;

    public VerifyPermitQueryHandler(IPermitRepository permitRepository)
    {
        _permitRepository = permitRepository;
    }

    public async Task<Result<PermitVerificationDto>> Handle(VerifyPermitQuery request, CancellationToken cancellationToken)
    {
        var permit = await _permitRepository.GetByPermitNumberAsync(request.PermitNumber, cancellationToken);

        if (permit is null)
        {
            return Result.Success(new PermitVerificationDto(false, null, "Permit not found"));
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var isValid = permit.IsValid(today);

        var message = isValid
            ? "Permit is valid"
            : permit.IsExpired(today)
                ? "Permit has expired"
                : $"Permit is {permit.Status}";

        var dto = new PermitDto(
            permit.Id,
            permit.PermitNumber,
            permit.ApplicationId,
            permit.ApplicationNumber,
            permit.Type,
            permit.Status,
            permit.OperatorId,
            permit.OperatorName,
            permit.AircraftId,
            permit.AircraftRegistration,
            permit.ValidFrom,
            permit.ValidUntil,
            permit.IssuedAt,
            permit.IssuedBy,
            permit.Conditions.ToList(),
            new MoneyDto(permit.FeesPaid.Amount, permit.FeesPaid.Currency.ToString()),
            permit.DocumentUrl,
            permit.CreatedAt,
            permit.UpdatedAt);

        return Result.Success(new PermitVerificationDto(isValid, dto, message));
    }
}
