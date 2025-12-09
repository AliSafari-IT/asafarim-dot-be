using AutoMapper;
using FreelanceToolkit.Api.DTOs;
using FreelanceToolkit.Api.Models;
using InvoiceDtos = FreelanceToolkit.Api.DTOs.Invoice;
using ProposalDtos = FreelanceToolkit.Api.DTOs.Proposal;

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
        CreateMap<Proposal, ProposalDtos.ProposalResponseDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<ProposalLineItem, ProposalLineItemDto>();
        CreateMap<CreateProposalLineItemDto, ProposalLineItem>();
        CreateMap<ProposalVersion, ProposalVersionDto>();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));
        CreateMap<Invoice, InvoiceDtos.InvoiceResponseDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.IssueDate, opt => opt.MapFrom(src => src.InvoiceDate))
            .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.SubTotal))
            .ForMember(dest => dest.TaxPercent, opt => opt.MapFrom(src => src.TaxRate));
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
