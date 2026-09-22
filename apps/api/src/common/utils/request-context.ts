import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request state, carried without threading it through every signature.
 *
 * The audit logger and the exception filter both need the acting user, the
 * client IP and the correlation id, and both sit well away from the controller
 * that had them. AsyncLocalStorage keeps that context attached to the async
 * chain of the request instead, so a service three layers down can record who
 * did a thing without taking the request object as an argument.
 */
export interface RequestContext {
  requestId: string;
  ip: string;
  userAgent: string | null;
  userId: string | null;
  username: string | null;
  method: string;
  path: string;
  startedAt: number;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Set once authentication resolves. The context object is created by the
 * middleware before the guards run, so the user is only known later.
 */
export function setContextUser(userId: string, username: string): void {
  const store = storage.getStore();
  if (store) {
    store.userId = userId;
    store.username = username;
  }
}
