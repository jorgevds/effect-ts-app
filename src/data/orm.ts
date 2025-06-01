import * as O from "effect/Option";
import { Context, Data } from "effect";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { ORMError } from "./ormError";

export class MalformedRequestError extends Data.TaggedError("MalformedRequestError")<{
    error: unknown;
}> {}

export class ORM extends Context.Tag("ORM")<ORM, typeof prisma>() {
    public static mount() {
        return prisma;
    }

    public static ormError(e: unknown): O.Option<ORMError> {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code != "") {
            return O.some(new ORMError({ error: e }));
        }
        return O.none();
    }
}
