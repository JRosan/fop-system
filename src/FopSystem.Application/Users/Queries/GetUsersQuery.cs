using FopSystem.Application.Common;
using FopSystem.Application.Users.Commands;
using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Users.Queries;

public sealed record GetUsersQuery(
    UserRole[]? Roles = null,
    bool? IsActive = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<PagedResult<UserDto>>;

public sealed class GetUsersQueryHandler : IQueryHandler<GetUsersQuery, PagedResult<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<PagedResult<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var (users, totalCount) = await _userRepository.GetPagedAsync(
            request.Roles,
            request.IsActive,
            request.Search,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var userDtos = users.Select(user => new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Phone,
            user.Role.ToString(),
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt)).ToList();

        return Result.Success(new PagedResult<UserDto>(
            userDtos,
            totalCount,
            request.PageNumber,
            request.PageSize));
    }
}
