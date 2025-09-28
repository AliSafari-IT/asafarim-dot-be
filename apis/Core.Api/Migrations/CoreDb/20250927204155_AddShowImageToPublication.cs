using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class AddShowImageToPublication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowImage",
                table: "Publications",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowImage",
                table: "Publications");
        }
    }
}
