using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixColumnCasingAndConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    // Safe drop - IF EXISTS handles already-applied manual fixes
    migrationBuilder.Sql(@"
        ALTER TABLE courses DROP CONSTRAINT IF EXISTS ""FK_courses_coursecategories_CourseCategoryId"";
        ALTER TABLE courses DROP CONSTRAINT IF EXISTS ""FK_courses_courseproviders_CourseProviderId"";

        -- Rename columns only if they still exist in PascalCase
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='Title') THEN
                ALTER TABLE courses RENAME COLUMN ""Title"" TO title;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='IsActive') THEN
                ALTER TABLE courses RENAME COLUMN ""IsActive"" TO isactive;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='DurationHours') THEN
                ALTER TABLE courses RENAME COLUMN ""DurationHours"" TO durationhours;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='Description') THEN
                ALTER TABLE courses RENAME COLUMN ""Description"" TO description;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='CreatedBy') THEN
                ALTER TABLE courses RENAME COLUMN ""CreatedBy"" TO createdby;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='CreatedAt') THEN
                ALTER TABLE courses RENAME COLUMN ""CreatedAt"" TO createdat;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='CourseProviderId') THEN
                ALTER TABLE courses RENAME COLUMN ""CourseProviderId"" TO courseproviderid;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='CourseCategoryId') THEN
                ALTER TABLE courses RENAME COLUMN ""CourseCategoryId"" TO coursecategoryid;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='Id') THEN
                ALTER TABLE courses RENAME COLUMN ""Id"" TO id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courseproviders' AND column_name='Website') THEN
                ALTER TABLE courseproviders RENAME COLUMN ""Website"" TO website;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courseproviders' AND column_name='Name') THEN
                ALTER TABLE courseproviders RENAME COLUMN ""Name"" TO name;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courseproviders' AND column_name='CreatedAt') THEN
                ALTER TABLE courseproviders RENAME COLUMN ""CreatedAt"" TO createdat;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courseproviders' AND column_name='Id') THEN
                ALTER TABLE courseproviders RENAME COLUMN ""Id"" TO id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coursecategories' AND column_name='Name') THEN
                ALTER TABLE coursecategories RENAME COLUMN ""Name"" TO name;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coursecategories' AND column_name='Description') THEN
                ALTER TABLE coursecategories RENAME COLUMN ""Description"" TO description;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coursecategories' AND column_name='CreatedAt') THEN
                ALTER TABLE coursecategories RENAME COLUMN ""CreatedAt"" TO createdat;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coursecategories' AND column_name='Id') THEN
                ALTER TABLE coursecategories RENAME COLUMN ""Id"" TO id;
            END IF;
        END $$;

        -- Recreate FK constraints with correct lowercase names
        ALTER TABLE courses DROP CONSTRAINT IF EXISTS fk_courses_coursecategories;
        ALTER TABLE courses DROP CONSTRAINT IF EXISTS fk_courses_courseproviders;
        
        ALTER TABLE courses ADD CONSTRAINT fk_courses_coursecategories
            FOREIGN KEY (coursecategoryid) REFERENCES coursecategories(id);
        ALTER TABLE courses ADD CONSTRAINT fk_courses_courseproviders
            FOREIGN KEY (courseproviderid) REFERENCES courseproviders(id);
    ");
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courses_coursecategories_coursecategoryid",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "FK_courses_courseproviders_courseproviderid",
                table: "courses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Todos",
                table: "Todos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Documents",
                table: "Documents");

            migrationBuilder.RenameTable(
                name: "Todos",
                newName: "todos");

            migrationBuilder.RenameTable(
                name: "Documents",
                newName: "documents");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "courses",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "isactive",
                table: "courses",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "durationhours",
                table: "courses",
                newName: "DurationHours");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "courses",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "createdby",
                table: "courses",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "courses",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "courseproviderid",
                table: "courses",
                newName: "CourseProviderId");

            migrationBuilder.RenameColumn(
                name: "coursecategoryid",
                table: "courses",
                newName: "CourseCategoryId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "courses",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_courses_courseproviderid",
                table: "courses",
                newName: "IX_courses_CourseProviderId");

            migrationBuilder.RenameIndex(
                name: "IX_courses_coursecategoryid",
                table: "courses",
                newName: "IX_courses_CourseCategoryId");

            migrationBuilder.RenameColumn(
                name: "website",
                table: "courseproviders",
                newName: "Website");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "courseproviders",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "courseproviders",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "courseproviders",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "coursecategories",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "coursecategories",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "coursecategories",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "coursecategories",
                newName: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_todos",
                table: "todos",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_documents",
                table: "documents",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_courses_coursecategories_CourseCategoryId",
                table: "courses",
                column: "CourseCategoryId",
                principalTable: "coursecategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_courses_courseproviders_CourseProviderId",
                table: "courses",
                column: "CourseProviderId",
                principalTable: "courseproviders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
