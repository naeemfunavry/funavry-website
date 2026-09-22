import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { ContentStatus } from "@funavry/types";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import { SLUG_PATTERN, SeoDto } from "src/modules/case-studies/dto/case-study.dto";

export class CreateIndustryDto {
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

  /** Two lines on the card. The cap is the design's, not the database's. */
  @ApiProperty({ maxLength: 320 })
  @IsString()
  @MaxLength(320)
  description: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  proof?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  imageId?: string | null;

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

export class UpdateIndustryDto extends PartialType(CreateIndustryDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}
