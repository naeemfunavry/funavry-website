import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { ContentStatus } from "@funavry/types";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { SLUG_PATTERN } from "src/modules/case-studies/dto/case-study.dto";

/** Shared by leaders and team members — the fields a person card carries. */
abstract class PersonBaseDto {
  @ApiProperty({ maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  role: string;

  /** The monogram the card shows until a portrait is supplied. */
  @ApiProperty({ maxLength: 4 })
  @IsString()
  @MinLength(1)
  @MaxLength(4)
  @Matches(/^[A-Z]+$/, { message: "initials must be upper-case letters" })
  initials: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  photoId?: string | null;

  @ApiPropertyOptional({ maxLength: 4000 })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string | null;

  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(512)
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateLeaderDto extends PersonBaseDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  /**
   * Flags rather than being inferred from the role line. The role is free text
   * ("Founder & CEO"), and a page that needs the founders should not be
   * string-matching prose an editor can reword.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFounder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCoFounder?: boolean;

  /** The card's bullets, in order. */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  points?: string[];
}

export class UpdateLeaderDto extends PartialType(CreateLeaderDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}

export class CreateTeamMemberDto extends PersonBaseDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  officeId?: string | null;
}

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}

export class CreateTestimonialDto {
  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  quote: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  author: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  role: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  company: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  avatarId?: string | null;

  /**
   * Defaults to true in the entity and is only ever cleared deliberately. An
   * unapproved quote renders with the "Placeholder" badge, so demo copy in the
   * database cannot be mistaken for an endorsement the client actually gave.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pending?: boolean;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}
