using FopSystem.Application.Interfaces;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Repositories;
using MediatR;

namespace FopSystem.Application.Users.Commands;

/// <summary>
/// Command for self-registration of new users.
/// </summary>
public record RegisterUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    string? CompanyName,
    Guid? TenantId = null) : IRequest<RegisterUserResult>;

public record RegisterUserResult(
    Guid UserId,
    string Email,
    string VerificationToken,
    bool RequiresEmailVerification);

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, RegisterUserResult>
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserCommandHandler(
        IUserRepository userRepository,
        ITenantRepository tenantRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegisterUserResult> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
    {
        // Check if email is already registered
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        // Create the user with Applicant role
        var user = User.Create(
            request.Email,
            request.FirstName,
            request.LastName,
            UserRole.Applicant,
            request.Phone);

        if (!string.IsNullOrEmpty(request.CompanyName))
        {
            user.SetCompanyName(request.CompanyName);
        }

        // Generate email verification token
        user.GenerateEmailVerificationToken();

        // Set tenant ID if provided, otherwise use default
        if (request.TenantId.HasValue)
        {
            user.SetTenantId(request.TenantId.Value);
        }
        else
        {
            // Get default tenant (BVI)
            var defaultTenant = await _tenantRepository.GetByCodeAsync("BVI", cancellationToken);
            if (defaultTenant != null)
            {
                user.SetTenantId(defaultTenant.Id);
            }
        }

        // User starts as inactive until email is verified
        user.Deactivate();

        _userRepository.Add(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send verification email
        await SendVerificationEmail(user, cancellationToken);

        return new RegisterUserResult(
            user.Id,
            user.Email,
            user.EmailVerificationToken!,
            true);
    }

    private async Task SendVerificationEmail(User user, CancellationToken cancellationToken)
    {
        var verificationUrl = $"https://fop.bvicad.gov.vg/verify-email?token={user.EmailVerificationToken}&email={Uri.EscapeDataString(user.Email)}";

        var subject = "Verify Your Email - BVI FOP System";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #F9FBFB; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 32px;">
                    <h1 style="color: #002D56; margin-bottom: 24px;">Welcome to the BVI FOP System</h1>
                    <p style="color: #374151; font-size: 16px;">Hi {user.FirstName},</p>
                    <p style="color: #374151; font-size: 16px;">Thank you for registering. Please verify your email address to complete your registration.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{verificationUrl}" style="background-color: #00A3B1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            </body>
            </html>
            """;

        await _emailService.SendEmailAsync(user.Email, subject, body, true, cancellationToken);
    }
}
