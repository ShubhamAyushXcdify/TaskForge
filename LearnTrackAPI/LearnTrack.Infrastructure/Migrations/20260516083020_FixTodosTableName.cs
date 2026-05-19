using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixTodosTableName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Rename table if it exists as Todos (PascalCase)
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Todos' AND table_schema = 'public') THEN
                        ALTER TABLE ""Todos"" RENAME TO todos;
                    END IF;
                END $$;

                -- Rename columns only if they still exist in PascalCase
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'Id') THEN
                        ALTER TABLE todos RENAME COLUMN ""Id"" TO id;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'UserId') THEN
                        ALTER TABLE todos RENAME COLUMN ""UserId"" TO userid;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'Title') THEN
                        ALTER TABLE todos RENAME COLUMN ""Title"" TO title;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'Description') THEN
                        ALTER TABLE todos RENAME COLUMN ""Description"" TO description;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'DueDate') THEN
                        ALTER TABLE todos RENAME COLUMN ""DueDate"" TO duedate;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'IsCompleted') THEN
                        ALTER TABLE todos RENAME COLUMN ""IsCompleted"" TO iscompleted;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'CreatedAt') THEN
                        ALTER TABLE todos RENAME COLUMN ""CreatedAt"" TO createdat;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'CompletedAt') THEN
                        ALTER TABLE todos RENAME COLUMN ""CompletedAt"" TO completedat;
                    END IF;
                END $$;

                -- Fix primary key name if needed
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PK_Todos') THEN
                        ALTER TABLE todos RENAME CONSTRAINT ""PK_Todos"" TO ""PK_todos"";
                    END IF;
                END $$;

                -- Also fix Documents table
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Documents' AND table_schema = 'public') THEN
                        ALTER TABLE ""Documents"" RENAME TO documents;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot safely reverse this
        }
    }
}