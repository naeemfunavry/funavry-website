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
  IsLatitude,
  IsLongitude,
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

/* ---------------------------------------------------------------- offices */

export class CreateOfficeDto {
  @ApiProperty({ maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  country: string;

  /** Unique — it heads each footer block and labels the globe marker. */
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  role: string;

  @ApiProperty({ maxLength: 320 })
  @IsString()
  @MaxLength(320)
  blurb: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  flagId?: string | null;

  /**
   * The office's real city, not a country centroid — the globe projects this
   * to place a marker and picks it as a camera target, and a centroid for the
   * USA would land in Kansas rather than on the coast the office is on.
   */
  @ApiProperty({ example: 73.04 })
  @Type(() => Number)
  @IsLongitude()
  longitude: number;

  @ApiProperty({ example: 33.69 })
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHeadquarters?: boolean;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[\d\s()+-]+$/, { message: "phone may only contain digits and + ( ) - and spaces" })
  phone?: string | null;

  /** One entry per printed line of the postal address. */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  addressLines?: string[];

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

export class UpdateOfficeDto extends PartialType(CreateOfficeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}

/* ------------------------------------------------------ delivery countries */

export class CreateDeliveryCountryDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ maxLength: 2, example: "PK" })
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: "code must be an ISO 3166-1 alpha-2 code" })
  code: string;

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

export class UpdateDeliveryCountryDto extends PartialType(CreateDeliveryCountryDto) {}

/* -------------------------------------------------------- clients/partners */

export class CreateClientDto {
  @ApiProperty({ maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  /** What the artwork says, not what the file is called. */
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  logoId?: string | null;

  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  @MaxLength(512)
  websiteUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPartner?: boolean;

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

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}

/* ----------------------------------------------------------- technologies */

export class CreateTechnologyDto {
  @ApiProperty({ maxLength: 140 })
  @IsString()
  @MaxLength(140)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  category: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9.-]+$/, { message: "iconSlug must be a simple-icons slug" })
  iconSlug?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  logoId?: string | null;

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

export class UpdateTechnologyDto extends PartialType(CreateTechnologyDto) {}

/* ------------------------------------------------------------------ stats */

export class CreateStatDto {
  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9_]+$/, { message: "key must be lower-case letters, digits and underscores" })
  key: string;

  @ApiProperty({ maxLength: 40, example: "500+" })
  @IsString()
  @MaxLength(40)
  value: string;

  @ApiProperty({ maxLength: 160, example: "Projects delivered" })
  @IsString()
  @MaxLength(160)
  label: string;

  @ApiPropertyOptional({ maxLength: 40, example: "about" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  group?: string;

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

export class UpdateStatDto extends PartialType(CreateStatDto) {}

/* ----------------------------------------------------------- social links */

export class CreateSocialLinkDto {
  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  label: string;

  @ApiProperty({ maxLength: 512 })
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(512)
  url: string;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9]+$/, { message: "icon must be a lucide-react icon name" })
  icon: string;

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

export class UpdateSocialLinkDto extends PartialType(CreateSocialLinkDto) {}
