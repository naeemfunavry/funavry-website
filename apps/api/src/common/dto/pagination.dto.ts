import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ContentStatus,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "@funavry/types";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

/**
 * The query shape every list endpoint accepts.
 *
 * `limit` is capped rather than merely defaulted. An uncapped page size is a
 * cheap denial of service — one request for a million rows will happily
 * exhaust the connection and the heap — so the ceiling is enforced here and
 * not left to each controller to remember.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: PAGINATION_MAX_LIMIT,
    default: PAGINATION_DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit?: number = PAGINATION_DEFAULT_LIMIT;

  /**
   * Free-text search. Length-capped, and every consumer binds it as a
   * parameter — never interpolated into SQL. The cap also stops a
   * pathologically long LIKE pattern being used to burn CPU.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  q?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  /**
   * Validated against an allow-list by each service before it reaches the query
   * builder. TypeORM interpolates the ORDER BY column name rather than binding
   * it, so an unchecked value here is a straightforward SQL injection.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sortBy?: string;

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortDir?: "ASC" | "DESC" = "DESC";

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  includeDeleted?: boolean = false;
}

/** Path/body param that must be a UUID this API issued. */
export class IdParamDto {
  @Type(() => String)
  @IsString()
  id: string;
}
