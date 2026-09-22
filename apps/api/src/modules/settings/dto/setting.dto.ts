import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class UpsertSettingDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9_.]+$/, {
    message: "key must be lower-case letters, digits, dots and underscores",
  })
  key: string;

  @ApiProperty({ maxLength: 20000 })
  @IsString()
  @MaxLength(20_000)
  value: string;

  @ApiPropertyOptional({ enum: ["string", "number", "boolean", "json"] })
  @IsOptional()
  @IsEnum(["string", "number", "boolean", "json"])
  valueType?: "string" | "number" | "boolean" | "json";

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  group?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string | null;
}
