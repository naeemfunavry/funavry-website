import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuditResource, type Post, Permission } from "@funavry/types";

import { createCrudController } from "src/common/controllers/crud.controller";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { PostsService } from "./posts.service";

const CrudBase = createCrudController<Post, CreatePostDto, UpdatePostDto>({
  name: "Posts",
  auditResource: AuditResource.POST,
  createDto: CreatePostDto,
  updateDto: UpdatePostDto,
  hasSlug: true,
});

@ApiTags("Posts")
@Controller("posts")
export class PostsController extends CrudBase {
  constructor(readonly service: PostsService) {
    super(service);
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "A published post by slug" })
  getPublicBySlug(@Param("slug") slug: string): Promise<Post> {
    return this.service.getBySlugDto(slug, true);
  }

  @Get("by-slug/:slug")
  @RequirePermissions(Permission.CONTENT_READ)
  getBySlug(@Param("slug") slug: string): Promise<Post> {
    return this.service.getBySlugDto(slug, false);
  }
}
