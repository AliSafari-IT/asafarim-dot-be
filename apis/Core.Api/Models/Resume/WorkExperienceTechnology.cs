using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class WorkExperienceTechnology : BaseEntity
    {
        public Guid WorkExperienceId { get; set; }
        public WorkExperience WorkExperience { get; set; } = null!;

        public Guid TechnologyId { get; set; }
        public Technology Technology { get; set; } = null!;
    }
}
