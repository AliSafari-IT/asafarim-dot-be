using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class FixTagsColumnType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old column and create a new one with the correct type
            migrationBuilder.Sql("ALTER TABLE \"Publications\" ADD COLUMN \"Tags_new\" text[] NULL");
            migrationBuilder.Sql("UPDATE \"Publications\" SET \"Tags_new\" = ARRAY(SELECT jsonb_array_elements_text(\"Tags\")) WHERE \"Tags\" IS NOT NULL");
            migrationBuilder.Sql("ALTER TABLE \"Publications\" DROP COLUMN \"Tags\"");
            migrationBuilder.Sql("ALTER TABLE \"Publications\" RENAME COLUMN \"Tags_new\" TO \"Tags\"");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<string>>(
                name: "Tags",
                table: "Publications",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(List<string>),
                oldType: "text[]",
                oldNullable: true);
        }
    }
}
