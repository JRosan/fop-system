using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Commands;

public sealed record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    string? Phone = null,
    string? AzureAdObjectId = null) : ICommand<UserDto>;

public sealed record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? Phone,
    string Role,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt);

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Phone));
        RuleFor(x => x.Role).IsInEnum();
    }
}

public sealed class CreateUserCommandHandler : ICommandHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<UserDto>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Check if user with email already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser is not null)
        {
            return Result.Failure<UserDto>(
                Error.Custom("User.EmailExists", "A user with this email already exists"));
        }

        var user = User.Create(
            request.Email,
            request.FirstName,
            request.LastName,
            request.Role,
            request.Phone,
            request.AzureAdObjectId);

        _userRepository.Add(user);
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
