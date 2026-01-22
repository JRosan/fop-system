using FopSystem.Domain.Aggregates.User;

namespace FopSystem.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByAzureAdObjectIdAsync(string objectId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<User> Users, int TotalCount)> GetPagedAsync(
        UserRole[]? roles = null,
        bool? isActive = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default);
    void Add(User user);
    void Remove(User user);
}
