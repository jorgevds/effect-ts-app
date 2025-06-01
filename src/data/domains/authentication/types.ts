import type { ParseError } from "@effect/schema/ParseResult";
import { Data } from "effect";
import * as S from "@effect/schema/Schema";

const PasswordBrand = Symbol.for("PasswordBrand");

export const passwordSchema = S.String.pipe(
    S.minLength(8, {
        message: () => "Password should be at least 8 characters long",
    }),
    S.maxLength(100, {
        message: () => "Password should be at most 100 characters long",
    }),
    S.brand(PasswordBrand)
);

export type Password = S.Schema.Type<typeof passwordSchema>;

export class PasswordHashError {
    readonly _tag = "PasswordHashError";
}
export class PasswordParseError extends Data.TaggedError("PasswordParseError")<{
    cause: ParseError;
}> {}
