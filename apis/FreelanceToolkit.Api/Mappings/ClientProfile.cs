using AutoMapper;
using FreelanceToolkit.Api.DTOs.Client;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class ClientProfile : Profile
{
    public ClientProfile()
    {
        // CreateClientDto -> Client
        CreateMap<CreateClientDto, Client>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Proposals, opt => opt.Ignore())
            .ForMember(dest => dest.Invoices, opt => opt.Ignore())
            .ForMember(dest => dest.CalendarBookings, opt => opt.Ignore());

        // UpdateClientDto -> Client
        CreateMap<UpdateClientDto, Client>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Proposals, opt => opt.Ignore())
            .ForMember(dest => dest.Invoices, opt => opt.Ignore())
            .ForMember(dest => dest.CalendarBookings, opt => opt.Ignore());

        // Client -> ClientResponseDto
        CreateMap<Client, ClientResponseDto>()
            .ForMember(dest => dest.ProposalsCount, opt => opt.MapFrom(src => src.Proposals.Count))
            .ForMember(dest => dest.InvoicesCount, opt => opt.MapFrom(src => src.Invoices.Count))
            .ForMember(
                dest => dest.BookingsCount,
                opt => opt.MapFrom(src => src.CalendarBookings.Count)
            )
            .ForMember(
                dest => dest.TotalRevenue,
                opt =>
                    opt.MapFrom(src =>
                        src.Invoices.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.Total)
                    )
            );
    }
}
