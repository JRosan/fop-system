using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Users.Commands;

/// <summary>
/// Command to complete password reset.
/// Note: In production, this would also handle setting the new password hash.
/// For now, we just validate the token as the actual auth is handled by Azure AD.
/// </summary>
public record ResetPasswordCommand(
    string Email,
    string Token) : IRequest<ResetPasswordResult>;

public record ResetPasswordResult(
    bool Success,
    string? ErrorMessage = null);

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ResetPasswordResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ResetPasswordCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ResetPasswordResult> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            return new ResetPasswordResult(false, "Invalid or expired reset token.");
        }

        if (!user.ValidatePasswordResetToken(request.Token))
        {
            return new ResetPasswordResult(false, "Invalid or expired reset token.");
        }

        // Clear the reset token
        user.ClearPasswordResetToken();

        // In a real implementation with local auth, we would set the password hash here
        // Since we're using Azure AD, this just validates the token was correct
        // The user would then be redirected to Azure AD to complete password reset

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ResetPasswordResult(true);
    }
}
