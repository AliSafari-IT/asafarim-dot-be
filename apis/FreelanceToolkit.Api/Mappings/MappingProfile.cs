using AutoMapper;
using FreelanceToolkit.Api.DTOs;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Client mappings
        CreateMap<Client, ClientDto>();
        CreateMap<CreateClientDto, Client>();

        // Proposal mappings
        CreateMap<Proposal, ProposalDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));
        CreateMap<ProposalLineItem, ProposalLineItemDto>();
        CreateMap<CreateProposalLineItemDto, ProposalLineItem>();
        CreateMap<ProposalVersion, ProposalVersionDto>();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));
        CreateMap<InvoiceLineItem, InvoiceLineItemDto>();
        CreateMap<CreateInvoiceLineItemDto, InvoiceLineItem>();

        // Calendar mappings
        CreateMap<CalendarBooking, CalendarBookingDto>();
        CreateMap<CreateBookingDto, CalendarBooking>();

        // Auth mappings
        CreateMap<ApplicationUser, UserDto>();
        CreateMap<ApplicationUser, UserProfileDto>();
    }
}
