using System;
using System.Collections.Generic;

namespace LearnTrack.Core.Entities
{
    public class Course
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal DurationHours { get; set; }
        public Guid CourseCategoryId { get; set; }
        public Guid CourseProviderId { get; set; }
        public bool IsActive { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public CourseCategory? Category { get; set; }
        public CourseProvider? Provider { get; set; }
        
        // This is the missing line that caused your errors:
        public ICollection<CourseAssignment> Assignments { get; set; } = new List<CourseAssignment>();
    }
}