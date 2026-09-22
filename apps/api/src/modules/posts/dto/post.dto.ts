import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { ContentStatus, PostKind } from "@funavry/types";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import { SLUG_PATTERN, SeoDto } from "src/modules/case-studies/dto/case-study.dto";

export class CreatePostDto {
  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  @ApiProperty({ enum: PostKind })
  @IsEnum(PostKind)
  kind: PostKind;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  excerpt: string;

  /**
   * The rendered body. Stored and served as-is, so whatever renders it on the
   * public site must treat it as untrusted — an editor with CONTENT_CREATE can
   * put a <script> tag here, and sanitising on read is the only place that can
   * be enforced for content already in the database.
   */
  @ApiPropertyOptional({ maxLength: 200000 })
  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string | null;

  /** Null renders "Coming soon", which is how the article slots ship today. */
  @ApiPropertyOptional({ type: String, format: "date" })
  @IsOptional()
  @IsDateString()
  displayDate?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  imageId?: string | null;

  /**
   * Restricted to http/https and rejecting a bare host. Without the protocol
   * allow-list a `javascript:` URL saved here becomes a click-to-execute link
   * rendered on the public site.
   */
  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  @MaxLength(512)
  externalUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  readingMinutes?: number | null;

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

  @ApiPropertyOptional({ type: SeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}
