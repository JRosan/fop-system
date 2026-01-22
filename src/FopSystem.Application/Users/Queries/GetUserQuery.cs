using FopSystem.Application.Common;
using FopSystem.Application.Users.Commands;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Queries;

public sealed record GetUserQuery(Guid UserId) : IQuery<UserDto>;

public sealed class GetUserQueryHandler : IQueryHandler<GetUserQuery, UserDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UserDto>> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<UserDto>(Error.NotFound);
        }

        return Result.Success(new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Phone,
            user.Role.ToString(),
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt));
    }
}
