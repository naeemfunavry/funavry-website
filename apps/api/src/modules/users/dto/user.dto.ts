import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@funavry/types";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

import { PaginationQueryDto } from "src/common/dto/pagination.dto";

export class CreateUserDto {
  @ApiProperty({ minLength: 3, maxLength: 64 })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9._-]+$/, {
    message: "username may contain lower-case letters, digits, dots, underscores and hyphens",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  username: string;

  @ApiProperty({ maxLength: 255 })
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName: string;

  /**
   * The initial password. The account is created with `mustChangePassword`
   * set, so this is a handover credential rather than a permanent one — the
   * user is forced to replace it before they can do anything else.
   */
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "password must contain a lowercase letter, an uppercase letter and a digit",
  })
  password: string;

  /**
   * At least one role. An account with none can authenticate but do nothing,
   * which reads as a broken login rather than as a permissions problem.
   */
  @ApiProperty({ enum: UserRole, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Note what is absent: no `password`.
 *
 * An administrator resetting someone's password goes through the dedicated
 * reset route, which forces a rotation flag and revokes that user's sessions.
 * Allowing it here would make a silent password change possible via an ordinary
 * profile edit, with none of that follow-through.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName?: string;

  @ApiPropertyOptional({ enum: UserRole, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  avatarId?: string | null;
}

export class ResetPasswordDto {
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "password must contain a lowercase letter, an uppercase letter and a digit",
  })
  newPassword: string;
}

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : value === "true" || value === true))
  @IsBoolean()
  isActive?: boolean;
}
