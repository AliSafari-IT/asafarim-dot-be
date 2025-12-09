using AutoMapper;
using FreelanceToolkit.Api.DTOs.Dashboard;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class DashboardProfile : Profile
{
    public DashboardProfile()
    {
        // Invoice -> RecentInvoiceDto
        CreateMap<Invoice, RecentInvoiceDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));

        // Proposal -> RecentProposalDto
        CreateMap<Proposal, RecentProposalDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));

        // CalendarBooking -> UpcomingBookingDto
        CreateMap<CalendarBooking, UpcomingBookingDto>()
            .ForMember(
                dest => dest.ClientName,
                opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null)
            );
    }
}
