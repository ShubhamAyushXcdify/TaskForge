using System;
using System.Collections.Generic;

namespace LearnTrack.Core.DTOs
{
    public class CourseSummaryDto
    {
        public int TotalAssigned { get; set; }
        public int TotalCompleted { get; set; }
        public int TotalInProgress { get; set; }
        public int TotalPending { get; set; }
        public int TotalOverdue { get; set; }
    }

    public class CourseAssignmentDetailsDto
    {
        public Guid AssignmentId { get; set; }
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string CourseCategory { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public double DurationHours { get; set; }
        public DateTime AssignedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public double ProgressPercentage { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class MyCoursesResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public CourseDataDto Data { get; set; } = new();
    }

    public class CourseDataDto
    {
        public CourseSummaryDto Summary { get; set; } = new();
        public List<CourseAssignmentDetailsDto> Assignments { get; set; } = new();
    }

    public class AllCoursesResponseDto
    {
        public bool Success { get; set; }
        public List<CourseListItemDto> Data { get; set; } = new();
    }

    public class CourseListItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public double DurationHours { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CourseCategoryResponseDto
    {
        public bool Success { get; set; }
        public List<CourseCategoryItemDto> Data { get; set; } = new();
    }

    public class CourseCategoryItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CourseProviderResponseDto
    {
        public bool Success { get; set; }
        public List<CourseProviderItemDto> Data { get; set; } = new();
    }

    public class CourseProviderItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
    }

    public class CreateCourseProviderDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
    }

    public class CourseDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double DurationHours { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public string? ProviderWebsite { get; set; }
        public int TotalAssignments { get; set; }
    }

    public class CourseDetailResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public CourseDetailDto? Data { get; set; }
    }

    // Add these to your existing CourseDTO.cs

public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public Guid ProviderId { get; set; }
    public decimal DurationHours { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCourseDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? ProviderId { get; set; }
    public decimal? DurationHours { get; set; }
    public bool? IsActive { get; set; }
}
}