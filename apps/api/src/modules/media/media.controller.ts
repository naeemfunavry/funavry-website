import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  type AuthUser,
  type MediaAsset,
  type Paginated,
  Permission,
} from "@funavry/types";

import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";
import { UnsupportedMediaException } from "src/common/exceptions/app.exception";

import { MediaQueryDto, UpdateMediaDto, UploadMediaDto } from "./dto/media.dto";
import { MediaService } from "./media.service";

/** The hard ceiling multer enforces before anything reaches the service. */
const ABSOLUTE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("Media")
@Controller("media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @RequirePermissions(Permission.CONTENT_READ)
  @ApiOperation({ summary: "List media assets" })
  findAll(@Query() query: MediaQueryDto): Promise<Paginated<MediaAsset>> {
    return this.media.findAll(query);
  }

  @Get(":id")
  @RequirePermissions(Permission.CONTENT_READ)
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<MediaAsset> {
    return this.media.findOne(id);
  }

  /**
   * Upload.
   *
   * The file is held in memory rather than written to a temp directory, so a
   * rejected upload leaves nothing on disk to clean up — and nothing on disk
   * during the window where its type has not yet been verified.
   *
   * The multer `limits` are a second ceiling in front of the per-purpose ones.
   * They abort the stream as it arrives, so an oversized body never gets fully
   * buffered just to be rejected afterwards.
   */
  @Post("upload")
  @RequirePermissions(Permission.MEDIA_UPLOAD)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload an image" })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: ABSOLUTE_MAX_BYTES,
        files: 1,
        fields: 10,
        /* Bounds the multipart header size — an unbounded field name is a
           cheap way to make the parser allocate. */
        fieldNameSize: 100,
        fieldSize: 1024,
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: AuthUser,
  ): Promise<MediaAsset> {
    if (!file) throw new UnsupportedMediaException("No file was uploaded.");

    return this.media.upload(file, dto.purpose, dto.alt, user.id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.MEDIA_UPLOAD)
  @ApiOperation({ summary: "Update an asset's alt text, caption or purpose" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMediaDto,
  ): Promise<MediaAsset> {
    return this.media.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions(Permission.MEDIA_DELETE)
  @ApiOperation({ summary: "Delete an asset, if nothing references it" })
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ id: string; deleted: true }> {
    return this.media.remove(id);
  }
}
