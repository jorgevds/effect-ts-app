"use server";

import * as O from "effect/Option";
import { Effect, Either, pipe } from "effect";

import { revalidatePath } from "next/cache";
import { ErrorCode, ORMError } from "../../data/ormError";
import { FormStateStatus, StandardFormSubmit } from "../types";
import { choreListServiceLive } from "../../data/domains/chore-list/service";

const errorMessages: Record<ErrorCode, string> = {
    catchAll: "Something went wrong",
    // TODO: deleting can never be a duplicate
    duplicate: "This item is a duplicate. Please contact support",
};

interface DeleteChoreListInitialState extends StandardFormSubmit {
    id: string;
}

export const deleteChoreListServerAction = async (initialState: DeleteChoreListInitialState, _: FormData) => {
    const result = await Effect.runPromise(Effect.either(choreListServiceLive.pipe(Effect.flatMap(s => s.delete(initialState.id)))));

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
