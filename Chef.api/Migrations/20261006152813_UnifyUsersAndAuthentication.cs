using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chef.api.Migrations
{
    /// <inheritdoc />
    public partial class UnifyUsersAndAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename existing AdminUsers table to Users to preserve all existing data
            migrationBuilder.RenameTable(
                name: "AdminUsers",
                newName: "Users");

            // Add new profile, lockout, and 2FA preparedness columns
            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AccessFailedCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockoutEnd",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorSecret",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.RenameIndex(
                name: "IX_AdminUsers_Email",
                table: "Users",
                newName: "IX_Users_Email");

            migrationBuilder.RenameIndex(
                name: "IX_AdminUsers_Username",
                table: "Users",
                newName: "IX_Users_Username");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PhoneNumber", table: "Users");
            migrationBuilder.DropColumn(name: "AccessFailedCount", table: "Users");
            migrationBuilder.DropColumn(name: "LockoutEnd", table: "Users");
            migrationBuilder.DropColumn(name: "TwoFactorEnabled", table: "Users");
            migrationBuilder.DropColumn(name: "TwoFactorSecret", table: "Users");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Email",
                table: "Users",
                newName: "IX_AdminUsers_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Username",
                table: "Users",
                newName: "IX_AdminUsers_Username");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "AdminUsers");
        }
    }
}
