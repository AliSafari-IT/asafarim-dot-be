using AutoMapper;
using FreelanceToolkit.Api.DTOs.Invoice;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class InvoiceProfile : Profile
{
    public InvoiceProfile()
    {
        // InvoiceLineItemDto -> InvoiceLineItem
        CreateMap<InvoiceLineItemDto, InvoiceLineItem>()
            .ForMember(dest => dest.InvoiceId, opt => opt.Ignore())
            .ForMember(dest => dest.Invoice, opt => opt.Ignore());

        // InvoiceLineItem -> InvoiceLineItemDto
        CreateMap<InvoiceLineItem, InvoiceLineItemDto>();

        // CreateInvoiceDto -> Invoice
        CreateMap<CreateInvoiceDto, Invoice>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceNumber, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore()) // Set manually
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.PaidAt, opt => opt.Ignore())
            .ForMember(dest => dest.SubTotal, opt => opt.Ignore()) // Calculated
            .ForMember(dest => dest.TaxAmount, opt => opt.Ignore())
            .ForMember(dest => dest.Total, opt => opt.Ignore())
            .ForMember(dest => dest.Client, opt => opt.Ignore())
            .ForMember(dest => dest.Proposal, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceDate, opt => opt.MapFrom(src => src.IssueDate))
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));

        // UpdateInvoiceDto -> Invoice
        CreateMap<UpdateInvoiceDto, Invoice>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.ClientId, opt => opt.Ignore())
            .ForMember(dest => dest.ProposalId, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceNumber, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.SubTotal, opt => opt.Ignore()) // Calculated
            .ForMember(dest => dest.TaxAmount, opt => opt.Ignore())
            .ForMember(dest => dest.Total, opt => opt.Ignore())
            .ForMember(dest => dest.Client, opt => opt.Ignore())
            .ForMember(dest => dest.Proposal, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceDate, opt => opt.MapFrom(src => src.IssueDate))
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));

        // Invoice -> InvoiceResponseDto
        CreateMap<Invoice, InvoiceResponseDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.SubTotal))
            .ForMember(dest => dest.TaxPercent, opt => opt.MapFrom(src => src.TaxRate))
            .ForMember(dest => dest.IssueDate, opt => opt.MapFrom(src => src.InvoiceDate))
            .ForMember(
                dest => dest.ProposalNumber,
                opt => opt.MapFrom(src => src.Proposal != null ? src.Proposal.ProposalNumber : null)
            )
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));
    }
}
