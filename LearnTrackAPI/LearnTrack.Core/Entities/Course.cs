namespace LearnTrack.Core.Entities
{
    public class Course
    {
        public Guid Id { get; set; }

        public Guid CourseProviderId { get; set; }
        public Guid CourseCategoryId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int DurationHours { get; set; }
        public bool IsActive { get; set; }

        public Guid CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
