import { Data } from "effect";

export const authenticationErrorCodes = ["access", "refresh"] as const;

export type AuthenticationErrorCode = (typeof authenticationErrorCodes)[number];

export class AuthenticationError extends Data.TaggedError("AuthenticationError") {}
