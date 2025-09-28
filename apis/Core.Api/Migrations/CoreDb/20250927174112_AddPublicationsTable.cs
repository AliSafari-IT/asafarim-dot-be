using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Core.Api.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class AddPublicationsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Publications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Subtitle = table.Column<string>(type: "text", nullable: true),
                    Meta = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Link = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    UseGradient = table.Column<bool>(type: "boolean", nullable: false),
                    Tags = table.Column<List<string>>(type: "jsonb", nullable: true),
                    Year = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Variant = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Size = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    FullWidth = table.Column<bool>(type: "boolean", nullable: false),
                    Elevated = table.Column<bool>(type: "boolean", nullable: false),
                    Bordered = table.Column<bool>(type: "boolean", nullable: false),
                    Clickable = table.Column<bool>(type: "boolean", nullable: false),
                    Featured = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AuthorId = table.Column<string>(type: "text", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    DOI = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    JournalName = table.Column<string>(type: "text", nullable: true),
                    ConferenceName = table.Column<string>(type: "text", nullable: true),
                    PublicationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Publications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublicationMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PublicationId = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicationMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublicationMetrics_Publications_PublicationId",
                        column: x => x.PublicationId,
                        principalTable: "Publications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PublicationMetrics_PublicationId",
                table: "PublicationMetrics",
                column: "PublicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PublicationMetrics");

            migrationBuilder.DropTable(
                name: "Publications");
        }
    }
}
