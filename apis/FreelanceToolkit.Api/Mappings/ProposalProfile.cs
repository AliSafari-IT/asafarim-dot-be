using AutoMapper;
using FreelanceToolkit.Api.DTOs.Proposal;
using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.Mappings;

public class ProposalProfile : Profile
{
    public ProposalProfile()
    {
        // ProposalLineItemDto -> ProposalLineItem
        CreateMap<ProposalLineItemDto, ProposalLineItem>()
            .ForMember(dest => dest.ProposalId, opt => opt.Ignore())
            .ForMember(dest => dest.Proposal, opt => opt.Ignore());

        // ProposalLineItem -> ProposalLineItemDto
        CreateMap<ProposalLineItem, ProposalLineItemDto>();

        // CreateProposalDto -> Proposal
        CreateMap<CreateProposalDto, Proposal>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.ProposalNumber, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore()) // Set manually
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.SentAt, opt => opt.Ignore())
            .ForMember(dest => dest.ViewedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcceptedAt, opt => opt.Ignore())
            .ForMember(dest => dest.RejectedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TotalAmount, opt => opt.Ignore()) // Calculated
            .ForMember(dest => dest.ProjectScope, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Client, opt => opt.Ignore())
            .ForMember(dest => dest.Template, opt => opt.Ignore())
            .ForMember(dest => dest.Versions, opt => opt.Ignore())
            .ForMember(dest => dest.Invoices, opt => opt.Ignore())
            .ForMember(dest => dest.PublicLink, opt => opt.Ignore())
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));

        // UpdateProposalDto -> Proposal
        CreateMap<UpdateProposalDto, Proposal>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.ClientId, opt => opt.Ignore())
            .ForMember(dest => dest.TemplateId, opt => opt.Ignore())
            .ForMember(dest => dest.ProposalNumber, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.SentAt, opt => opt.Ignore())
            .ForMember(dest => dest.ViewedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcceptedAt, opt => opt.Ignore())
            .ForMember(dest => dest.RejectedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TotalAmount, opt => opt.Ignore()) // Calculated
            .ForMember(dest => dest.ProjectScope, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Client, opt => opt.Ignore())
            .ForMember(dest => dest.Template, opt => opt.Ignore())
            .ForMember(dest => dest.Versions, opt => opt.Ignore())
            .ForMember(dest => dest.Invoices, opt => opt.Ignore())
            .ForMember(dest => dest.PublicLink, opt => opt.Ignore())
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));

        // Proposal -> ProposalResponseDto
        CreateMap<Proposal, ProposalResponseDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ProjectScope, opt => opt.MapFrom(src => src.ProjectScope))
            .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount))
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.LineItems));

        // ProposalTemplate -> ProposalTemplateDto
        CreateMap<ProposalTemplate, ProposalTemplateDto>();

        // ProposalTemplateDto -> ProposalTemplate
        CreateMap<ProposalTemplateDto, ProposalTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Version, opt => opt.Ignore())
            .ForMember(dest => dest.Proposals, opt => opt.Ignore());

        // ProposalVersion -> ProposalVersionDto
        CreateMap<ProposalVersion, ProposalVersionDto>()
            .ForMember(dest => dest.LineItems, opt => opt.Ignore()); // Content is JSON, needs manual deserialization if needed
    }
}
