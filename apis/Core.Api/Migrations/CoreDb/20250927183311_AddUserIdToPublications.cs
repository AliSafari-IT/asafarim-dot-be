using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class AddUserIdToPublications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Publications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Publications");
        }
    }
}
