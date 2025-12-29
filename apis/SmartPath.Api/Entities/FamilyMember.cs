namespace SmartPath.Api.Entities;

public class FamilyMember
{
    public int FamilyMemberId { get; set; }
    public int FamilyId { get; set; }
    public int UserId { get; set; }
    public string Role { get; set; } = "Child";
    public DateTime? DateOfBirth { get; set; }
    public DateTime JoinedAt { get; set; }

    public Family? Family { get; set; }
    public User? User { get; set; }
}
