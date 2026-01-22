using FopSystem.Domain.Aggregates.User;
using FopSystem.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FopDbContext _context;

    public UserRepository(FopDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToLowerInvariant();
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public async Task<User?> GetByAzureAdObjectIdAsync(string objectId, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.AzureAdObjectId == objectId, cancellationToken);
    }

    public async Task<(IReadOnlyList<User> Users, int TotalCount)> GetPagedAsync(
        UserRole[]? roles = null,
        bool? isActive = null,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsQueryable();

        if (roles is not null && roles.Length > 0)
        {
            query = query.Where(u => roles.Contains(u.Role));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLowerInvariant();
            query = query.Where(u =>
                u.Email.Contains(searchLower) ||
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalCount);
    }

    public async Task<IReadOnlyList<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Where(u => u.Role == role && u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public void Add(User user)
    {
        _context.Users.Add(user);
    }

    public void Remove(User user)
    {
        _context.Users.Remove(user);
    }
}
