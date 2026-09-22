import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsUUID, Min, ValidateNested } from "class-validator";

export class ReorderItemDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  id: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

/**
 * A drag-and-drop reorder. The whole affected set is sent and rewritten in one
 * transaction, rather than PATCHing each row — a half-applied reorder leaves
 * the list in an order nobody chose.
 */
export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
