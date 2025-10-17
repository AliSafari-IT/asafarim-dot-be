using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.Resume
{
    /// <inheritdoc />
    public partial class AddPortfolioResumeLinking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EntityName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectResumeLinks",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResumeId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkExperienceId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectResumeLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectResumeLinks_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "public",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectResumeLinks_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalSchema: "public",
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectResumeLinks_WorkExperiences_WorkExperienceId",
                        column: x => x.WorkExperienceId,
                        principalSchema: "public",
                        principalTable: "WorkExperiences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PublicationResumeLinks",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicationId = table.Column<int>(type: "integer", nullable: false),
                    ResumeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicationResumeLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublicationResumeLinks_Publications_PublicationId",
                        column: x => x.PublicationId,
                        principalTable: "Publications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PublicationResumeLinks_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalSchema: "public",
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_EntityType_EntityId",
                schema: "public",
                table: "ActivityLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_Timestamp",
                schema: "public",
                table: "ActivityLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_UserId",
                schema: "public",
                table: "ActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResumeLinks_ProjectId_ResumeId",
                schema: "public",
                table: "ProjectResumeLinks",
                columns: new[] { "ProjectId", "ResumeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResumeLinks_ResumeId",
                schema: "public",
                table: "ProjectResumeLinks",
                column: "ResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResumeLinks_WorkExperienceId",
                schema: "public",
                table: "ProjectResumeLinks",
                column: "WorkExperienceId");

            migrationBuilder.CreateIndex(
                name: "IX_PublicationResumeLinks_PublicationId_ResumeId",
                schema: "public",
                table: "PublicationResumeLinks",
                columns: new[] { "PublicationId", "ResumeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicationResumeLinks_ResumeId",
                schema: "public",
                table: "PublicationResumeLinks",
                column: "ResumeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityLogs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ProjectResumeLinks",
                schema: "public");

            migrationBuilder.DropTable(
                name: "PublicationResumeLinks",
                schema: "public");
        }
    }
}
