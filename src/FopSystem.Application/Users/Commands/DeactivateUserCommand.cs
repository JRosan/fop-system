using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Commands;

public sealed record DeactivateUserCommand(Guid UserId) : ICommand;

public sealed class DeactivateUserCommandHandler : ICommandHandler<DeactivateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            user.Deactivate();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("User.AlreadyInactive", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
