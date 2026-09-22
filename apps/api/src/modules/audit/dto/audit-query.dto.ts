import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction, AuditResource } from "@funavry/types";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsIP, IsOptional, IsUUID } from "class-validator";

import { PaginationQueryDto } from "src/common/dto/pagination.dto";

export class AuditQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ enum: AuditResource })
  @IsOptional()
  @IsEnum(AuditResource)
  resource?: AuditResource;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  actorId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  resourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : value === "true" || value === true))
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({ type: String, format: "date-time" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ type: String, format: "date-time" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
