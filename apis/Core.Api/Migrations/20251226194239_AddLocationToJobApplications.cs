using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationToJobApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "public",
                table: "JobApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                schema: "public",
                table: "JobApplications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                schema: "public",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "Location",
                schema: "public",
                table: "JobApplications");
        }
    }
}
