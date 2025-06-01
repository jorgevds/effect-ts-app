"use server";

import * as O from "effect/Option";
import { Effect, Either, pipe } from "effect";

import { choreServiceLive } from "../data/domains/chore/service";
import { revalidatePath } from "next/cache";
import { ErrorCode, ORMError } from "../data/ormError";
import { FormStateStatus } from "./createChore";

export const deleteChoreServerAction = async (initialState: { id: string; status: FormStateStatus; error?: string }, data: FormData) => {
    const result = await Effect.runPromise(Effect.either(choreServiceLive.pipe(Effect.flatMap(s => s.deleteChore(initialState.id)))));

    const errorMessages: Record<ErrorCode, string> = {
        catchAll: "Something went wrong",
        duplicate: "This item is a duplicate. Please contact support",
    };

    return Either.match(result, {
        onLeft: e => ({
            ...initialState,
            error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
            status: "error" as FormStateStatus,
        }),
        onRight: chore => {
            revalidatePath("/");

            return {
                ...initialState,
                error: "",
                status: "success" as FormStateStatus,
                id: pipe(chore, O.match({ onNone: () => initialState.id, onSome: chore => chore.id })),
            };
        },
    });
};
