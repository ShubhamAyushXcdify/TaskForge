using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Infrastructure.Data;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminDashboardController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/dashboard
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;

        // ── Core counts ──────────────────────────────────────────────
        var totalEmployees  = await _context.Employees.CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var activeCourses   = await _context.Courses.CountAsync(c => c.IsActive);

        var allAssignments  = await _context.CourseAssignments.ToListAsync();
        var totalAssignments   = allAssignments.Count;
        var completedCount     = allAssignments.Count(a => a.Status == "Completed");
        var inProgressCount    = allAssignments.Count(a => a.Status == "InProgress");
        var assignedCount      = allAssignments.Count(a => a.Status == "Assigned" || a.Status == "Pending");
        var overdueCount       = allAssignments.Count(a =>
            a.DueDate.HasValue &&
            a.DueDate.Value < now &&
            a.Status != "Completed");
        var certsIssued        = allAssignments.Count(a => a.CertificateUrl != null);
        var completionRate     = totalAssignments > 0
            ? Math.Round((double)completedCount / totalAssignments * 100, 2)
            : 0;

        // ── Status breakdown ─────────────────────────────────────────
        var statusBreakdown = new
        {
            Assigned   = assignedCount,
            InProgress = inProgressCount,
            Completed  = completedCount,
            Overdue    = overdueCount
        };

        // ── Category breakdown ───────────────────────────────────────
        var categoryBreakdown = await (
            from course in _context.Courses
            join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
            join assignment in _context.CourseAssignments on course.Id equals assignment.CourseId into assignmentGroup
            from assignment in assignmentGroup.DefaultIfEmpty()
            group new { assignment, course } by new { category.Id, category.Name } into g
            select new
            {
                Category       = g.Key.Name,
                TotalCourses   = g.Select(x => x.course.Id).Distinct().Count(),
                Assigned       = g.Count(x => x.assignment != null),
                Completed      = g.Count(x => x.assignment != null && x.assignment.Status == "Completed"),
                CompletionRate = g.Count(x => x.assignment != null) > 0
                    ? Math.Round(
                        (double)g.Count(x => x.assignment != null && x.assignment.Status == "Completed") /
                        g.Count(x => x.assignment != null) * 100, 2)
                    : 0.0
            }
        ).ToListAsync();

        // ── Top 3 most assigned courses ──────────────────────────────
        var topCourses = await (
            from course in _context.Courses
            join assignment in _context.CourseAssignments on course.Id equals assignment.CourseId into ag
            orderby ag.Count() descending
            select new
            {
                CourseId      = course.Id,
                Title         = course.Title,
                CourseUrl     = course.CourseUrl,
                TotalAssigned = ag.Count(),
                Completed     = ag.Count(a => a.Status == "Completed"),
                CompletionRate = ag.Count() > 0
                    ? Math.Round((double)ag.Count(a => a.Status == "Completed") / ag.Count() * 100, 2)
                    : 0.0
            }
        ).Take(3).ToListAsync();

        // ── Activity feed (last 10) ───────────────────────────────────
        // Completed assignments
        var completedActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "Completed" && a.CompletionDate != null
            orderby a.CompletionDate descending
            select new
            {
                Id           = a.Id,
                Type         = "completed",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "completed",
                CourseTitle  = course.Title,
                Time         = a.CompletionDate
            }
        ).Take(10).ToListAsync();

        // InProgress (started) assignments
        var startedActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "InProgress" && a.StartDate != null
            orderby a.StartDate descending
            select new
            {
                Id           = a.Id,
                Type         = "started",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "started",
                CourseTitle  = course.Title,
                Time         = a.StartDate
            }
        ).Take(10).ToListAsync();

        // Assigned (enrolled) assignments
        var enrolledActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "Assigned" || a.Status == "Pending"
            orderby a.CreatedAt descending
            select new
            {
                Id           = a.Id,
                Type         = "enrolled",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "enrolled in",
                CourseTitle  = course.Title,
                Time         = (DateTime?)a.CreatedAt
            }
        ).Take(10).ToListAsync();

        // Merge and take last 10 by time
        var activityFeed = completedActivities
            .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time })
            .Concat(startedActivities
                .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time }))
            .Concat(enrolledActivities
                .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time }))
            .OrderByDescending(x => x.Time)
            .Take(10)
            .ToList();

        // ── Overdue employees ────────────────────────────────────────
        var overdueEmployees = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            where a.DueDate.HasValue && a.DueDate.Value < now && a.Status != "Completed"
            group a by new { emp.Id, emp.FirstName, emp.LastName, emp.EmployeeCode } into g
            orderby g.Count() descending
            select new
            {
                EmployeeId   = g.Key.Id,
                Name         = g.Key.FirstName + " " + g.Key.LastName,
                EmployeeCode = g.Key.EmployeeCode,
                OverdueCount = g.Count()
            }
        ).ToListAsync();

        // ── Recent certificates ──────────────────────────────────────
        var recentCertificates = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.CertificateUrl != null
            orderby a.CompletionDate descending
            select new
            {
                AssignmentId   = a.Id,
                EmployeeName   = emp.FirstName + " " + emp.LastName,
                CourseTitle    = course.Title,
                CertificateUrl = a.CertificateUrl,
                IssuedAt       = a.CompletionDate
            }
        ).Take(5).ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Stats = new
                {
                    TotalEmployees  = totalEmployees,
                    ActiveEmployees = activeEmployees,
                    ActiveCourses   = activeCourses,
                    TotalAssignments = totalAssignments,
                    CompletionRate  = completionRate,
                    OverdueCount    = overdueCount,
                    CertsIssued     = certsIssued
                },
                StatusBreakdown    = statusBreakdown,
                CategoryBreakdown  = categoryBreakdown,
                TopCourses         = topCourses,
                ActivityFeed       = activityFeed,
                OverdueEmployees   = overdueEmployees,
                RecentCertificates = recentCertificates
            }
        });
    }
}