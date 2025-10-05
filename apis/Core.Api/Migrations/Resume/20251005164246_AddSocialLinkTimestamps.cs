using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.Resume
{
    /// <inheritdoc />
    public partial class AddSocialLinkTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SocialLinks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()"
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "SocialLinks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "UpdatedAt", table: "SocialLinks");

            migrationBuilder.DropColumn(name: "CreatedAt", table: "SocialLinks");
        }
    }
}
