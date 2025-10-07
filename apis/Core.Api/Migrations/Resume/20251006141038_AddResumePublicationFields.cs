using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.Resume
{
    /// <inheritdoc />
    public partial class AddResumePublicationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                schema: "public",
                table: "Resumes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublicConsentGivenAt",
                schema: "public",
                table: "Resumes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicConsentIp",
                schema: "public",
                table: "Resumes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicSlug",
                schema: "public",
                table: "Resumes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                schema: "public",
                table: "Resumes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_PublicSlug",
                schema: "public",
                table: "Resumes",
                column: "PublicSlug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Resumes_PublicSlug",
                schema: "public",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                schema: "public",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "PublicConsentGivenAt",
                schema: "public",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "PublicConsentIp",
                schema: "public",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "PublicSlug",
                schema: "public",
                table: "Resumes");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                schema: "public",
                table: "Resumes");
        }
    }
}
