using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ai.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialChatTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chat_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_archived = table.Column<bool>(type: "boolean", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    last_message_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    message_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_sessions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    tokens_used = table.Column<int>(type: "integer", nullable: true),
                    model_used = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    response_time_ms = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_chat_messages_chat_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_created_at",
                table: "chat_messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_role",
                table: "chat_messages",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_session_id",
                table: "chat_messages",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_user_id",
                table: "chat_messages",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_sessions_created_at",
                table: "chat_sessions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_chat_sessions_last_message_at",
                table: "chat_sessions",
                column: "last_message_at");

            migrationBuilder.CreateIndex(
                name: "IX_chat_sessions_user_id",
                table: "chat_sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_sessions_user_id_is_deleted",
                table: "chat_sessions",
                columns: new[] { "user_id", "is_deleted" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_messages");

            migrationBuilder.DropTable(
                name: "chat_sessions");
        }
    }
}
