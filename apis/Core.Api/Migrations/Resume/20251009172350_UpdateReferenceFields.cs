using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.Resume
{
    /// <inheritdoc />
    public partial class UpdateReferenceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactInfo",
                schema: "public",
                table: "References");

            migrationBuilder.AddColumn<string>(
                name: "Company",
                schema: "public",
                table: "References",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "public",
                table: "References",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                schema: "public",
                table: "References",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                schema: "public",
                table: "References",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Company",
                schema: "public",
                table: "References");

            migrationBuilder.DropColumn(
                name: "Email",
                schema: "public",
                table: "References");

            migrationBuilder.DropColumn(
                name: "Phone",
                schema: "public",
                table: "References");

            migrationBuilder.DropColumn(
                name: "Position",
                schema: "public",
                table: "References");

            migrationBuilder.AddColumn<string>(
                name: "ContactInfo",
                schema: "public",
                table: "References",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
