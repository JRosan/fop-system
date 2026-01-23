using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Users.Commands;

/// <summary>
/// Command to verify a user's email address.
/// </summary>
public record VerifyEmailCommand(
    string Email,
    string Token) : IRequest<VerifyEmailResult>;

public record VerifyEmailResult(
    bool Success,
    string? ErrorMessage = null);

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, VerifyEmailResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyEmailCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VerifyEmailResult> Handle(
        VerifyEmailCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            return new VerifyEmailResult(false, "User not found.");
        }

        if (user.IsEmailVerified)
        {
            return new VerifyEmailResult(true); // Already verified
        }

        var verified = user.VerifyEmail(request.Token);
        if (!verified)
        {
            return new VerifyEmailResult(false, "Invalid or expired verification token.");
        }

        // Activate the user now that email is verified
        if (!user.IsActive)
        {
            user.Activate();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new VerifyEmailResult(true);
    }
}
