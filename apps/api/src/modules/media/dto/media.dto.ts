import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MediaPurpose } from "@funavry/types";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

import { PaginationQueryDto } from "src/common/dto/pagination.dto";

export class UploadMediaDto {
  @ApiProperty({ enum: MediaPurpose })
  @IsEnum(MediaPurpose)
  purpose: MediaPurpose;

  /**
   * Required, with no default. An image with no alt text is a hole in the
   * page for anyone using a screen reader, and making it optional here is how
   * it ends up empty on every asset in the library.
   */
  @ApiProperty({ maxLength: 320 })
  @IsString()
  @MaxLength(320)
  alt: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ maxLength: 320 })
  @IsOptional()
  @IsString()
  @MaxLength(320)
  alt?: string;

  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  caption?: string;

  @ApiPropertyOptional({ enum: MediaPurpose })
  @IsOptional()
  @IsEnum(MediaPurpose)
  purpose?: MediaPurpose;
}

export class MediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MediaPurpose })
  @IsOptional()
  @IsEnum(MediaPurpose)
  purpose?: MediaPurpose;
}
