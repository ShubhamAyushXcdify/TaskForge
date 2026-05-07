namespace LearnTrack.Core.Entities
{
    public class CourseCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        // Add this line:
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
}