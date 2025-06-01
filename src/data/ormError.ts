import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Data } from "effect";

export const errorCodes = ["duplicate", "catchAll"] as const;

export type ErrorCode = (typeof errorCodes)[number];

export class ORMError extends Data.TaggedError("ORMError")<{
    error: PrismaClientKnownRequestError;
}> {
    public get parseCode(): ErrorCode {
        if (this.error.code === "P2002") {
            return "duplicate";
        }
        return "catchAll";
    }
}
