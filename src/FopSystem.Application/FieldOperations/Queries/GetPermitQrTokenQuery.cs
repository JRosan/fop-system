using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Application.Interfaces;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.FieldOperations.Queries;

public sealed record GetPermitQrTokenQuery(Guid PermitId) : IQuery<PermitQrTokenDto>;

public sealed class GetPermitQrTokenQueryValidator : AbstractValidator<GetPermitQrTokenQuery>
{
    public GetPermitQrTokenQueryValidator()
    {
        RuleFor(x => x.PermitId).NotEmpty();
    }
}

public sealed class GetPermitQrTokenQueryHandler : IQueryHandler<GetPermitQrTokenQuery, PermitQrTokenDto>
{
    private readonly IPermitRepository _permitRepository;
    private readonly IJwtPermitTokenService _tokenService;

    public GetPermitQrTokenQueryHandler(
        IPermitRepository permitRepository,
        IJwtPermitTokenService tokenService)
    {
        _permitRepository = permitRepository;
        _tokenService = tokenService;
    }

    public async Task<Result<PermitQrTokenDto>> Handle(
        GetPermitQrTokenQuery request,
        CancellationToken cancellationToken)
    {
        var permit = await _permitRepository.GetByIdAsync(request.PermitId, cancellationToken);

        if (permit is null)
        {
            return Result.Failure<PermitQrTokenDto>(Error.NotFound);
        }

        var (token, expiresAt) = await _tokenService.GenerateTokenAsync(permit);

        return Result.Success(new PermitQrTokenDto(
            Token: token,
            ExpiresAt: expiresAt,
            PermitNumber: permit.PermitNumber,
            QrCodeData: token));
    }
}
