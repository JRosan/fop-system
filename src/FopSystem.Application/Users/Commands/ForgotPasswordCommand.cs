using FopSystem.Application.Interfaces;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Users.Commands;

/// <summary>
/// Command to initiate password reset.
/// </summary>
public record ForgotPasswordCommand(string Email) : IRequest<ForgotPasswordResult>;

public record ForgotPasswordResult(
    bool Success,
    string? Message = null);

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ForgotPasswordResult> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Always return success to prevent email enumeration attacks
        if (user == null)
        {
            return new ForgotPasswordResult(true, "If an account exists with this email, a password reset link will be sent.");
        }

        // Generate password reset token
        user.GeneratePasswordResetToken();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send password reset email
        await SendPasswordResetEmail(user.Email, user.FirstName, user.PasswordResetToken!, cancellationToken);

        return new ForgotPasswordResult(true, "If an account exists with this email, a password reset link will be sent.");
    }

    private async Task SendPasswordResetEmail(string email, string firstName, string token, CancellationToken cancellationToken)
    {
        var resetUrl = $"https://fop.bvicad.gov.vg/reset-password?token={token}&email={Uri.EscapeDataString(email)}";

        var subject = "Reset Your Password - BVI FOP System";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #F9FBFB; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 32px;">
                    <h1 style="color: #002D56; margin-bottom: 24px;">Password Reset Request</h1>
                    <p style="color: #374151; font-size: 16px;">Hi {firstName},</p>
                    <p style="color: #374151; font-size: 16px;">We received a request to reset your password. Click the button below to create a new password.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{resetUrl}" style="background-color: #00A3B1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            </body>
            </html>
            """;

        await _emailService.SendEmailAsync(email, subject, body, true, cancellationToken);
    }
}
