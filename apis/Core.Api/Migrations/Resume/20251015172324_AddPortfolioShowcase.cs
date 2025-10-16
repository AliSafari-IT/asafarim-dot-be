using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.Resume
{
    /// <inheritdoc />
    public partial class AddPortfolioShowcase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "public",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DemoUrl",
                schema: "public",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                schema: "public",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "GithubUrl",
                schema: "public",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                schema: "public",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                schema: "public",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "public",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "PortfolioSettings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicSlug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    Theme = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SectionOrderJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectImages",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectImages_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "public",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectPublications",
                schema: "public",
                columns: table => new
                {
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectPublications", x => new { x.ProjectId, x.PublicationId });
                    table.ForeignKey(
                        name: "FK_ProjectPublications_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "public",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectPublications_Publications_PublicationId",
                        column: x => x.PublicationId,
                        principalTable: "Publications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectWorkExperiences",
                schema: "public",
                columns: table => new
                {
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkExperienceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectWorkExperiences", x => new { x.ProjectId, x.WorkExperienceId });
                    table.ForeignKey(
                        name: "FK_ProjectWorkExperiences_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "public",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectWorkExperiences_WorkExperiences_WorkExperienceId",
                        column: x => x.WorkExperienceId,
                        principalSchema: "public",
                        principalTable: "WorkExperiences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioSettings_PublicSlug",
                schema: "public",
                table: "PortfolioSettings",
                column: "PublicSlug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioSettings_UserId",
                schema: "public",
                table: "PortfolioSettings",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImages_ProjectId_DisplayOrder",
                schema: "public",
                table: "ProjectImages",
                columns: new[] { "ProjectId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPublications_PublicationId",
                schema: "public",
                table: "ProjectPublications",
                column: "PublicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectWorkExperiences_WorkExperienceId",
                schema: "public",
                table: "ProjectWorkExperiences",
                column: "WorkExperienceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PortfolioSettings",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ProjectImages",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ProjectPublications",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ProjectWorkExperiences",
                schema: "public");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DemoUrl",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "GithubUrl",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ShortDescription",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "public",
                table: "Projects");
        }
    }
}
