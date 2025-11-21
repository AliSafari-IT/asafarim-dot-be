using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedByIdToFixtures : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First add the new column as nullable
            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedById",
                table: "TestFixtures",
                type: "uuid",
                nullable: true
            );

            // Convert text columns to jsonb with explicit cast
            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""RequestHooks"" TYPE jsonb USING ""RequestHooks""::jsonb;"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""Metadata"" TYPE jsonb USING ""Metadata""::jsonb;"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""ClientScripts"" TYPE jsonb USING ""ClientScripts""::jsonb;"
            );

            // Other column type changes
            migrationBuilder.AlterColumn<string>(
                name: "HttpAuthUsername",
                table: "TestFixtures",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "HttpAuthPassword",
                table: "TestFixtures",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "SkipReason",
                table: "TestCases",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "PageUrl",
                table: "TestCases",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert column types back to text
            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""RequestHooks"" TYPE text USING ""RequestHooks""::text;"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""Metadata"" TYPE text USING ""Metadata""::text;"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TestFixtures"" 
                ALTER COLUMN ""ClientScripts"" TYPE text USING ""ClientScripts""::text;"
            );

            // Remove the added column
            migrationBuilder.DropColumn(name: "UpdatedById", table: "TestFixtures");

            // Revert other column type changes
            migrationBuilder.AlterColumn<string>(
                name: "HttpAuthUsername",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "HttpAuthPassword",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "SkipReason",
                table: "TestCases",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "PageUrl",
                table: "TestCases",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true
            );
        }
    }
}
