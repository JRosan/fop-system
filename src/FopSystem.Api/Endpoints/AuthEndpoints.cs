using FopSystem.Application.Users.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication")
            .WithOpenApi()
            .AllowAnonymous();

        group.MapPost("/register", Register)
            .WithName("Register")
            .WithSummary("Register a new user account")
            .Produces<RegisterResponse>(201)
            .Produces<ProblemDetails>(400);

        group.MapPost("/verify-email", VerifyEmail)
            .WithName("VerifyEmail")
            .WithSummary("Verify email address with token")
            .Produces<VerifyEmailResponse>()
            .Produces<ProblemDetails>(400);

        group.MapPost("/forgot-password", ForgotPassword)
            .WithName("ForgotPassword")
            .WithSummary("Request password reset email")
            .Produces<ForgotPasswordResponse>();

        group.MapPost("/reset-password", ResetPassword)
            .WithName("ResetPassword")
            .WithSummary("Complete password reset with token")
            .Produces<ResetPasswordResponse>()
            .Produces<ProblemDetails>(400);

        group.MapPost("/resend-verification", ResendVerification)
            .WithName("ResendVerification")
            .WithSummary("Resend email verification link")
            .Produces<ResendVerificationResponse>()
            .Produces<ProblemDetails>(400);
    }

    private static async Task<IResult> Register(
        [FromServices] IMediator mediator,
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new RegisterUserCommand(
                request.Email,
                request.FirstName,
                request.LastName,
                request.Phone,
                request.CompanyName,
                request.TenantId), cancellationToken);

            return Results.Created($"/api/users/{result.UserId}", new RegisterResponse(
                result.UserId,
                result.Email,
                result.RequiresEmailVerification,
                "Registration successful. Please check your email to verify your account."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static async Task<IResult> VerifyEmail(
        [FromServices] IMediator mediator,
        [FromBody] VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new VerifyEmailCommand(
            request.Email,
            request.Token), cancellationToken);

        if (result.Success)
        {
            return Results.Ok(new VerifyEmailResponse(
                true,
                "Email verified successfully. You can now log in."));
        }

        return Results.Problem(result.ErrorMessage ?? "Verification failed.", statusCode: 400);
    }

    private static async Task<IResult> ForgotPassword(
        [FromServices] IMediator mediator,
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ForgotPasswordCommand(request.Email), cancellationToken);

        // Always return success to prevent email enumeration
        return Results.Ok(new ForgotPasswordResponse(
            true,
            result.Message ?? "If an account exists with this email, a password reset link will be sent."));
    }

    private static async Task<IResult> ResetPassword(
        [FromServices] IMediator mediator,
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ResetPasswordCommand(
            request.Email,
            request.Token), cancellationToken);

        if (result.Success)
        {
            return Results.Ok(new ResetPasswordResponse(
                true,
                "Password reset successful. You can now log in with your new password."));
        }

        return Results.Problem(result.ErrorMessage ?? "Reset failed.", statusCode: 400);
    }

    private static async Task<IResult> ResendVerification(
        [FromServices] IMediator mediator,
        [FromServices] FopSystem.Domain.Repositories.IUserRepository userRepository,
        [FromServices] FopSystem.Application.Interfaces.IEmailService emailService,
        [FromServices] FopSystem.Domain.Repositories.IUnitOfWork unitOfWork,
        [FromBody] ResendVerificationRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Always return success to prevent email enumeration
        if (user == null || user.IsEmailVerified)
        {
            return Results.Ok(new ResendVerificationResponse(
                true,
                "If an unverified account exists with this email, a new verification link will be sent."));
        }

        // Generate new verification token
        user.GenerateEmailVerificationToken();
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Send new verification email
        var verificationUrl = $"https://fop.bvicad.gov.vg/verify-email?token={user.EmailVerificationToken}&email={Uri.EscapeDataString(user.Email)}";

        var subject = "Verify Your Email - BVI FOP System";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #F9FBFB; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 32px;">
                    <h1 style="color: #002D56; margin-bottom: 24px;">Email Verification</h1>
                    <p style="color: #374151; font-size: 16px;">Hi {user.FirstName},</p>
                    <p style="color: #374151; font-size: 16px;">Here's a new verification link for your account.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{verificationUrl}" style="background-color: #00A3B1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
                </div>
            </body>
            </html>
            """;

        await emailService.SendEmailAsync(user.Email, subject, body, true, cancellationToken);

        return Results.Ok(new ResendVerificationResponse(
            true,
            "If an unverified account exists with this email, a new verification link will be sent."));
    }
}

// Request/Response DTOs
public record RegisterRequest(
    string Email,
    string FirstName,
    string LastName,
    string? Phone = null,
    string? CompanyName = null,
    Guid? TenantId = null);

public record RegisterResponse(
    Guid UserId,
    string Email,
    bool RequiresEmailVerification,
    string Message);

public record VerifyEmailRequest(
    string Email,
    string Token);

public record VerifyEmailResponse(
    bool Success,
    string Message);

public record ForgotPasswordRequest(string Email);

public record ForgotPasswordResponse(
    bool Success,
    string Message);

public record ResetPasswordRequest(
    string Email,
    string Token);

public record ResetPasswordResponse(
    bool Success,
    string Message);

public record ResendVerificationRequest(string Email);

public record ResendVerificationResponse(
    bool Success,
    string Message);
