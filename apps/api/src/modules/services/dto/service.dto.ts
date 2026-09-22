import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { ContentStatus, DeliveryPhase, ServiceGroup } from "@funavry/types";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
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

export class ServiceSubDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class CreateServiceDto {
  @ApiProperty({ maxLength: 140 })
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(SLUG_PATTERN, { message: "slug must be lower-case words separated by single hyphens" })
  slug: string;

  /** Display number, "01".."16". Presentation, not the sort key. */
  @ApiProperty({ maxLength: 2 })
  @IsString()
  @Matches(/^\d{2}$/, { message: "number must be two digits, e.g. 01" })
  number: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ enum: ServiceGroup })
  @IsEnum(ServiceGroup)
  group: ServiceGroup;

  @ApiProperty({ enum: DeliveryPhase })
  @IsEnum(DeliveryPhase)
  phase: DeliveryPhase;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9]+$/, { message: "icon must be a lucide-react icon name" })
  icon: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  summary: string;

  @ApiPropertyOptional({ type: [ServiceSubDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ServiceSubDto)
  subs?: ServiceSubDto[];

  /** Curated proof, strongest example first — ordering is the array's. */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID("4", { each: true })
  caseStudyIds?: string[];

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

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}
