import { SetMetadata } from "@nestjs/common";

export const RAW_RESPONSE_KEY = "rawResponse";

/**
 * Opts a handler out of the response envelope, for the cases where a wrapper
 * would corrupt the payload — streamed files, and the health endpoint whose
 * shape is dictated by whatever is probing it.
 */
export const RawResponse = (): MethodDecorator => SetMetadata(RAW_RESPONSE_KEY, true);
