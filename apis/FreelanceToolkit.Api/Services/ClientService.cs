using AutoMapper;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Client;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Services;

public class ClientService : IClientService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ClientService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientDto dto, string userId)
    {
        var client = _mapper.Map<Client>(dto);
        client.Id = Guid.NewGuid();
        client.UserId = userId;
        client.CreatedAt = DateTime.UtcNow;

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(client.Id, userId);
    }

    public async Task<ClientResponseDto> UpdateAsync(Guid id, UpdateClientDto dto, string userId)
    {
        var client = await _context
            .Clients.Include(c => c.Proposals)
            .Include(c => c.Invoices)
            .Include(c => c.CalendarBookings)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (client == null)
            throw new KeyNotFoundException($"Client with ID {id} not found");

        _mapper.Map(dto, client);
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<ClientResponseDto>(client);
    }

    public async Task<ClientResponseDto> GetByIdAsync(Guid id, string userId)
    {
        var client = await _context
            .Clients.Include(c => c.Proposals)
            .Include(c => c.Invoices)
            .Include(c => c.CalendarBookings)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (client == null)
            throw new KeyNotFoundException($"Client with ID {id} not found");

        return _mapper.Map<ClientResponseDto>(client);
    }

    public async Task<List<ClientResponseDto>> GetAllAsync(
        string userId,
        string? search = null,
        List<string>? tags = null
    )
    {
        var query = _context
            .Clients.Include(c => c.Proposals)
            .Include(c => c.Invoices)
            .Include(c => c.CalendarBookings)
            .Where(c => c.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c =>
                c.Name.Contains(search)
                || (c.Email != null && c.Email.Contains(search))
                || (c.CompanyName != null && c.CompanyName.Contains(search))
            );
        }

        if (tags != null && tags.Any())
        {
            query = query.Where(c => c.Tags != null && c.Tags.Any(t => tags.Contains(t)));
        }

        var clients = await query.OrderBy(c => c.Name).ToListAsync();
        return _mapper.Map<List<ClientResponseDto>>(clients);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c =>
            c.Id == id && c.UserId == userId
        );

        if (client == null)
            throw new KeyNotFoundException($"Client with ID {id} not found");

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Guid id, string userId)
    {
        return await _context.Clients.AnyAsync(c => c.Id == id && c.UserId == userId);
    }
}
