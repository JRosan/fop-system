using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Commands;

public sealed record UpdateUserCommand(
    Guid UserId,
    string? FirstName = null,
    string? LastName = null,
    string? Phone = null,
    UserRole? Role = null) : ICommand<UserDto>;

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FirstName).MaximumLength(100).When(x => x.FirstName is not null);
        RuleFor(x => x.LastName).MaximumLength(100).When(x => x.LastName is not null);
        RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone is not null);
        RuleFor(x => x.Role).IsInEnum().When(x => x.Role is not null);
    }
}

public sealed class UpdateUserCommandHandler : ICommandHandler<UpdateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<UserDto>(Error.NotFound);
        }

        user.Update(
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Role);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(MapToDto(user));
    }

    private static UserDto MapToDto(User user) => new(
        user.Id,
        user.Email,
        user.FirstName,
        user.LastName,
        user.FullName,
        user.Phone,
        user.Role.ToString(),
        user.IsActive,
        user.LastLoginAt,
        user.CreatedAt);
}
