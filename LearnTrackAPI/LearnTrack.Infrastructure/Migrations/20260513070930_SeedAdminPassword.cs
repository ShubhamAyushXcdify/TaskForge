using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE EXTENSION IF NOT EXISTS pgcrypto;
                UPDATE users 
                SET passwordhash = crypt('admin@123', gen_salt('bf', 11))
                WHERE email = 'admin1@gmail.com';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reverse a password reset
        }
    }
}