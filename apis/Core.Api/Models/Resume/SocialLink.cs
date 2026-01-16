using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class SocialLink : BaseEntity
    {
        public Guid ResumeId { get; set; }

        public string Platform { get; set; } = string.Empty; // e.g., "GitHub", "LinkedIn"
        public string Url { get; set; } = string.Empty;

        public Resume? Resume { get; set; }
    }
}
