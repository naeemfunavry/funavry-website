import { ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import type { ApiFieldError } from "@funavry/types";
import type { ValidationError } from "class-validator";

import { ValidationException } from "../exceptions/app.exception";

/**
 * Flattens class-validator's nested error tree into dotted field paths, so the
 * admin form can attach each message to the input that produced it —
 * `sections.2.heading` rather than a heap of prose.
 */
function flatten(errors: ValidationError[], parent = ""): ApiFieldError[] {
  const out: ApiFieldError[] = [];

  for (const err of errors) {
    const path = parent ? `${parent}.${err.property}` : err.property;

    if (err.constraints) {
      for (const [code, message] of Object.entries(err.constraints)) {
        out.push({ field: path, message, code });
      }
    }

    if (err.children?.length) {
      out.push(...flatten(err.children, path));
    }
  }

  return out;
}

/**
 * The global input gate. Three settings carry the weight:
 *
 * `whitelist` drops any property the DTO does not declare, and `forbidNonWhitelisted`
 * turns an undeclared property into a rejection rather than a silent strip. That
 * pair is what closes mass assignment — without it, a POST carrying `"role":
 * "SUPER_ADMIN"` or `"id": "..."` reaches the entity and TypeORM writes it.
 *
 * `transform` with `enableImplicitConversion: false` means a query string `"5"`
 * becomes a number only where the DTO says `@Type(() => Number)`. Implicit
 * conversion is convenient and coerces in surprising directions — `"0"` to
 * `false`, an array to a string — so it stays off and the DTOs are explicit.
 */
export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: false,
    excludeExtraneousValues: false,
  },
  stopAtFirstError: false,
  validationError: {
    /* Keep the rejected value out of the error — it is echoed to the client and
       could contain the very credential that failed validation. */
    target: false,
    value: false,
  },
  exceptionFactory: (errors: ValidationError[]) => new ValidationException(flatten(errors)),
};

export const globalValidationPipe = new ValidationPipe(validationPipeOptions);
