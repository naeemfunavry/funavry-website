/**
 * Every entity, exported once. The TypeORM module and the CLI data source both
 * read this list, so a new entity is registered in one place rather than two
 * that drift — the classic symptom being a migration that generates fine and a
 * repository that cannot be injected.
 */
export * from "./base.entity";
export * from "./seo.embedded";
export * from "./user.entity";
export * from "./refresh-token.entity";
export * from "./media-asset.entity";
export * from "./audit-log.entity";
export * from "./case-study.entity";
export * from "./service.entity";
export * from "./industry.entity";
export * from "./post.entity";
export * from "./people.entity";
export * from "./office.entity";
export * from "./org.entity";

import { AuditLogEntity, LoginAttemptEntity } from "./audit-log.entity";
import {
  CaseStudyCalloutEntity,
  CaseStudyCapabilityEntity,
  CaseStudyChallengeEntity,
  CaseStudyEntity,
  CaseStudyHighlightEntity,
  CaseStudyMetaRowEntity,
  CaseStudyParagraphEntity,
  CaseStudyScreenshotEntity,
  CaseStudyStatEntity,
} from "./case-study.entity";
import { IndustryEntity } from "./industry.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import {
  DeliveryCountryEntity,
  OfficeAddressLineEntity,
  OfficeEntity,
} from "./office.entity";
import {
  ClientEntity,
  SettingEntity,
  SocialLinkEntity,
  StatEntity,
  TechnologyEntity,
} from "./org.entity";
import {
  LeaderEntity,
  LeaderPointEntity,
  TeamMemberEntity,
  TestimonialEntity,
} from "./people.entity";
import { PostEntity } from "./post.entity";
import { RefreshTokenEntity } from "./refresh-token.entity";
import { ServiceEntity, ServiceSubEntity } from "./service.entity";
import { PermissionEntity, RoleEntity, UserEntity } from "./user.entity";

export const ENTITIES = [
  /* identity */
  UserEntity,
  RoleEntity,
  PermissionEntity,
  RefreshTokenEntity,
  /* observability */
  AuditLogEntity,
  LoginAttemptEntity,
  /* media */
  MediaAssetEntity,
  /* case studies */
  CaseStudyEntity,
  CaseStudyCapabilityEntity,
  CaseStudyCalloutEntity,
  CaseStudyHighlightEntity,
  CaseStudyStatEntity,
  CaseStudyMetaRowEntity,
  CaseStudyParagraphEntity,
  CaseStudyChallengeEntity,
  CaseStudyScreenshotEntity,
  /* taxonomy */
  ServiceEntity,
  ServiceSubEntity,
  IndustryEntity,
  /* editorial */
  PostEntity,
  /* people */
  LeaderEntity,
  LeaderPointEntity,
  TeamMemberEntity,
  TestimonialEntity,
  /* footprint */
  OfficeEntity,
  OfficeAddressLineEntity,
  DeliveryCountryEntity,
  /* org */
  ClientEntity,
  TechnologyEntity,
  StatEntity,
  SocialLinkEntity,
  SettingEntity,
];
