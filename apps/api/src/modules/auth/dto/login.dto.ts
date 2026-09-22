import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  /**
   * Username or email. Accepting either means this cannot be `@IsEmail`, so it
   * is constrained by character class instead — the set below covers both forms
   * and excludes the control and quote characters that show up in injection
   * probes against a login form.
   */
  @ApiProperty({ example: "admin", maxLength: 255 })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9._@+-]+$/, {
    message: "identifier contains invalid characters",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  identifier: string;

  /**
   * Bounded at both ends. The lower bound is obvious; the upper one is a
   * denial-of-service control — Argon2 hashes whatever it is given, and a
   * multi-megabyte "password" would tie up 19 MiB of memory and a CPU core per
   * request. 128 is well past any real password.
   */
  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword: string;

  /**
   * The composition rule is deliberately mild and the length floor does the
   * real work. Long-and-memorable beats short-and-symbol-stuffed, and aggressive
   * complexity rules push people towards `Password1!` and a sticky note.
   */
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12, { message: "New password must be at least 12 characters" })
  @MaxLength(128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "New password must contain at least one lowercase letter, one uppercase letter and one digit",
  })
  newPassword: string;
}
