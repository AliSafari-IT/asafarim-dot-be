using System.Collections.Generic;
using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class Resume : BaseEntity
    {
        public string UserId { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;

        // Publication metadata (GDPR-compliant public sharing)
        public bool IsPublic { get; set; } = false;
        public string? PublicSlug { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime? PublicConsentGivenAt { get; set; }
        public string? PublicConsentIp { get; set; }

        // Contact info (one-to-one)
        public ContactInfo? Contact { get; set; }

        // Navigation collections
        public ICollection<Skill> Skills { get; set; } = new List<Skill>();
        public ICollection<Education> EducationItems { get; set; } = new List<Education>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public ICollection<WorkExperience> WorkExperiences { get; set; } =
            new List<WorkExperience>();
        public ICollection<SocialLink> SocialLinks { get; set; } = new List<SocialLink>();
        public ICollection<Language> Languages { get; set; } = new List<Language>();
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<Award> Awards { get; set; } = new List<Award>();
        public ICollection<Reference> References { get; set; } = new List<Reference>();
    }
}
