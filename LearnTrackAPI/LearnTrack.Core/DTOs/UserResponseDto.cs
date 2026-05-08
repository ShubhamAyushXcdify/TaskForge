using System;

namespace LearnTrack.Core.DTOs
{
    public class UserResponseDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Returns "Admin", "Manager", etc.
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsEmailVerified { get; set; }
    }

    public class CreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmployeeCode { get; set; }
        public Guid RoleId { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmployeeCode { get; set; }
        public bool? IsActive { get; set; }
        public string? PasswordHash { get; set; }
        public Guid? RoleId { get; set; }
    }
}