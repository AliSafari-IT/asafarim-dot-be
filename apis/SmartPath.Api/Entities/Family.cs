namespace SmartPath.Api.Entities;

public class Family
{
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? CreatedBy { get; set; }
    public ICollection<FamilyMember> Members { get; set; } = new List<FamilyMember>();
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
