/**
 * The contract shared by the API, the admin panel and the public site.
 *
 * Nothing here imports from an app — it is types and plain enums only, so both
 * front-ends and the NestJS server can depend on it without pulling in each
 * other's runtime.
 */
export * from "./envelope";
export * from "./enums";
export * from "./dto";
