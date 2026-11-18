using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodePursuit.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteOwnerUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerUserId",
                table: "Notes",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Notes");
        }
    }
}
