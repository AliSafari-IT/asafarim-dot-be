using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToJobApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                schema: "public",
                table: "JobApplications",
                type: "character varying(450)",
                maxLength: 450,
                nullable: true,
                defaultValue: null);
            
            // Delete any existing job applications without a user (orphaned data)
            migrationBuilder.Sql("DELETE FROM public.\"JobApplications\" WHERE \"UserId\" IS NULL OR \"UserId\" = '';");
            
            // Now make the column required
            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "public",
                table: "JobApplications",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "public",
                table: "JobApplications");
        }
    }
}
