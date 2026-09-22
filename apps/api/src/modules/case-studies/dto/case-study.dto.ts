import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  CaseStudyFrame,
  CaseStudySurface,
  ContentStatus,
  DeliveryPhase,
} from "@funavry/types";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import { PaginationQueryDto } from "src/common/dto/pagination.dto";

/**
 * The slug rule, applied everywhere a slug is accepted.
 *
 * Lower-case, digits and single hyphens only. A slug becomes a URL segment and
 * a filesystem-adjacent identifier, so anything looser invites encoding bugs
 * at best and path traversal at worst — and it keeps the canonical URLs stable
 * and readable, which is the point of having slugs at all.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CapabilityDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  label: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class CalloutDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  /**
   * The capability this callout names. A foreign key, not a free-text label:
   * a callout is a claim about a client's system printed over a picture of it,
   * so it may only name something the study actually listed.
   */
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  capabilityId: string;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9]+$/, { message: "icon must be a lucide-react icon name" })
  icon: string;

  /**
   * Anchor as a fraction of the capture. Capped at 0.3 rather than 1: the chip
   * hangs to the left of its anchor, and past that it stops clearing the window
   * and sits on the capture itself.
   */
  @ApiProperty({ minimum: 0, maximum: 0.3 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(0.3)
  x: number;

  @ApiProperty({ minimum: 0, maximum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  y: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class ValuePairDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  value: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  detail: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class StatDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  value: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  label: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class MetaRowDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  label: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  value: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class ChallengeDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  challenge: string;

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  solution: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class ScreenshotDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  mediaId: string;

  @ApiProperty({ enum: ["cover", "contain"] })
  @IsEnum(["cover", "contain"])
  fit: "cover" | "contain";

  @ApiProperty()
  @IsBoolean()
  lead: boolean;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class SeoDto {
  @ApiPropertyOptional({ maxLength: 180 })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string | null;

  @ApiPropertyOptional({ maxLength: 320 })
  @IsOptional()
  @IsString()
  @MaxLength(320)
  description?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  ogImageId?: string | null;

  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  canonicalUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;
}

export class CreateCaseStudyDto {
  @ApiProperty({ maxLength: 140, pattern: SLUG_PATTERN.source })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(SLUG_PATTERN, {
    message: "slug must be lower-case words separated by single hyphens",
  })
  slug: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 320 })
  @IsString()
  @MaxLength(320)
  tagline: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  sector: string;

  @ApiProperty({ enum: DeliveryPhase })
  @IsEnum(DeliveryPhase)
  phase: DeliveryPhase;

  @ApiProperty({ enum: CaseStudySurface })
  @IsEnum(CaseStudySurface)
  surface: CaseStudySurface;

  @ApiProperty({ enum: CaseStudyFrame })
  @IsEnum(CaseStudyFrame)
  frame: CaseStudyFrame;

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  summary: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  client?: string | null;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  team?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

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

  /* ------------------------------------------------------- detail page -- */

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  introHeading?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(4000, { each: true })
  intro?: string[];

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  challengesLead?: string | null;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resultsLead?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  results?: string[];

  /* ---------------------------------------------------------- imagery --- */

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  imageId?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  mobileImageId?: string | null;

  /* --------------------------------------------------------- children --- */

  @ApiPropertyOptional({ type: [CapabilityDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CapabilityDto)
  capabilities?: CapabilityDto[];

  @ApiPropertyOptional({ type: [CalloutDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CalloutDto)
  callouts?: CalloutDto[];

  @ApiPropertyOptional({ type: [ValuePairDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ValuePairDto)
  highlights?: ValuePairDto[];

  @ApiPropertyOptional({ type: [StatDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats?: StatDto[];

  @ApiPropertyOptional({ type: [MetaRowDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MetaRowDto)
  meta?: MetaRowDto[];

  @ApiPropertyOptional({ type: [ChallengeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChallengeDto)
  challenges?: ChallengeDto[];

  @ApiPropertyOptional({ type: [ScreenshotDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ScreenshotDto)
  screenshots?: ScreenshotDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID("4", { each: true })
  industryIds?: string[];

  @ApiPropertyOptional({ type: SeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}

/**
 * PartialType makes every field optional while keeping its validators, so a
 * PATCH cannot smuggle in a value the POST would have rejected.
 */
export class UpdateCaseStudyDto extends PartialType(CreateCaseStudyDto) {
  /** Optimistic concurrency — the version the editor loaded. */
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}

export class CaseStudyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DeliveryPhase })
  @IsOptional()
  @IsEnum(DeliveryPhase)
  phase?: DeliveryPhase;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : value === "true" || value === true))
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(140)
  industrySlug?: string;
}
