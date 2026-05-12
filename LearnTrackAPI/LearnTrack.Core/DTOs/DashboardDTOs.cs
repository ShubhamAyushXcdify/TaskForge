using System;
using System.Collections.Generic;

namespace LearnTrack.Core.DTOs
{
    public class DashboardStatsDto
    {
        public int Assigned { get; set; }
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int NotStarted { get; set; }
        public double CompletionRate { get; set; }
        public double TotalHoursSpent { get; set; }
        public double? AvgScore { get; set; }
    }

    public class DashboardStatsResponse
    {
        public bool Success { get; set; }
        public DashboardStatsDto Data { get; set; } = new();
    }

    public class DayHourDto
    {
        public string Day { get; set; } = string.Empty;
        public double Hours { get; set; }
    }

    public class WeeklyHoursDataDto
    {
        public List<DayHourDto> ThisWeek { get; set; } = new();
        public List<DayHourDto> LastWeek { get; set; } = new();
    }

    public class WeeklyHoursResponse
    {
        public bool Success { get; set; }
        public WeeklyHoursDataDto Data { get; set; } = new();
    }

    public class CategoryBreakdownDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class CategoryBreakdownResponse
    {
        public bool Success { get; set; }
        public List<CategoryBreakdownDto> Data { get; set; } = new();
    }

    public class ActivityDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class ActivityResponse
    {
        public bool Success { get; set; }
        public List<ActivityDto> Data { get; set; } = new();
    }
}