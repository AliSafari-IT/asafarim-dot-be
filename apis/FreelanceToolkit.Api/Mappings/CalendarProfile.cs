using AutoMapper;
using FreelanceToolkit.Api.DTOs.Calendar;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class CalendarProfile : Profile
{
    public CalendarProfile()
    {
        // CreateBookingDto -> CalendarBooking
        CreateMap<CreateBookingDto, CalendarBooking>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => BookingStatus.Pending))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Client, opt => opt.Ignore());

        // UpdateBookingDto -> CalendarBooking
        CreateMap<UpdateBookingDto, CalendarBooking>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.ClientId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Client, opt => opt.Ignore());

        // CalendarBooking -> BookingResponseDto
        CreateMap<CalendarBooking, BookingResponseDto>()
            .ForMember(
                dest => dest.ClientName,
                opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null)
            )
            .ForMember(
                dest => dest.ClientEmail,
                opt => opt.MapFrom(src => src.Client != null ? src.Client.Email : null)
            );
    }
}
