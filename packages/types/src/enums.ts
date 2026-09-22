/**
 * Domain enums, shared by the database entities, the request DTOs and both
 * front-ends. The string values are what MySQL stores and what crosses the
 * wire, so they are stable identifiers — renaming one is a migration, not a
 * refactor.
 */

/** The editorial lifecycle every content row carries. */
export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Roles, coarse-grained on purpose. Fine-grained capability lives in
 * `Permission`; a role is a named bundle of those.
 */
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

/**
 * Capabilities, checked by the `@RequirePermissions` guard. Resource-scoped so
 * a new content type adds rows rather than reshaping the model.
 */
export enum Permission {
  CONTENT_READ = "content:read",
  CONTENT_CREATE = "content:create",
  CONTENT_UPDATE = "content:update",
  CONTENT_DELETE = "content:delete",
  CONTENT_PUBLISH = "content:publish",
  MEDIA_UPLOAD = "media:upload",
  MEDIA_DELETE = "media:delete",
  USER_READ = "user:read",
  USER_MANAGE = "user:manage",
  AUDIT_READ = "audit:read",
  SETTINGS_MANAGE = "settings:manage",
}

/** Build → Automate → Operate, the spine the whole site is organised around. */
export enum DeliveryPhase {
  BUILD = "Build",
  AUTOMATE = "Automate",
  OPERATE = "Operate",
}

/** Which side of the business a service line belongs to. */
export enum ServiceGroup {
  TECH = "tech",
  GBS = "gbs",
}

/** Who a captured product was built for — drives the window chrome. */
export enum CaseStudySurface {
  SITE = "site",
  APP = "app",
}

/** What the capture is presented in on the home deck. Purely rhythm. */
export enum CaseStudyFrame {
  LAPTOP = "laptop",
  WINDOW = "window",
}

export enum PostKind {
  BLOG = "Blog",
  NEWS = "News",
  CASE_NOTE = "Case Note",
}

/** What a media asset is for. Drives validation limits and derivative sizes. */
export enum MediaPurpose {
  CASE_STUDY_CAPTURE = "CASE_STUDY_CAPTURE",
  CASE_STUDY_MOBILE = "CASE_STUDY_MOBILE",
  TEAM_PORTRAIT = "TEAM_PORTRAIT",
  CLIENT_LOGO = "CLIENT_LOGO",
  PARTNER_LOGO = "PARTNER_LOGO",
  INDUSTRY_COVER = "INDUSTRY_COVER",
  POST_HERO = "POST_HERO",
  TESTIMONIAL_AVATAR = "TESTIMONIAL_AVATAR",
  OFFICE_FLAG = "OFFICE_FLAG",
  TECH_LOGO = "TECH_LOGO",
  GENERAL = "GENERAL",
}

/** Where a media file physically lives. Local today, S3 once configured. */
export enum StorageDriver {
  LOCAL = "LOCAL",
  S3 = "S3",
}

/* ------------------------------------------------------------- audit trail */

/** The verbs the audit log records. */
export enum AuditAction {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE",
  PUBLISH = "PUBLISH",
  UNPUBLISH = "UNPUBLISH",
  REORDER = "REORDER",
  MEDIA_UPLOAD = "MEDIA_UPLOAD",
  MEDIA_DELETE = "MEDIA_DELETE",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DISABLED = "USER_DISABLED",
  REVALIDATE = "REVALIDATE",
}

/** Every auditable table, named once so the log can be filtered reliably. */
export enum AuditResource {
  AUTH = "auth",
  USER = "user",
  CASE_STUDY = "case_study",
  CASE_STUDY_SECTION = "case_study_section",
  SERVICE = "service",
  INDUSTRY = "industry",
  OFFICE = "office",
  POST = "post",
  LEADER = "leader",
  TEAM_MEMBER = "team_member",
  CLIENT = "client",
  PARTNER = "partner",
  TESTIMONIAL = "testimonial",
  TECHNOLOGY = "technology",
  STAT = "stat",
  SOCIAL_LINK = "social_link",
  MEDIA = "media",
  SETTING = "setting",
}
