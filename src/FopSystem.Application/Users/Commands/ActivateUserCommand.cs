using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Commands;

public sealed record ActivateUserCommand(Guid UserId) : ICommand;

public sealed class ActivateUserCommandHandler : ICommandHandler<ActivateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ActivateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            user.Activate();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("User.AlreadyActive", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
