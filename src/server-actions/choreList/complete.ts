"use server";

import * as O from "effect/Option";
import { Effect, Either, pipe } from "effect";

import { revalidatePath } from "next/cache";
import { ErrorCode, ORMError } from "../../data/ormError";
import { FormStateStatus, StandardFormSubmit } from "../types";
import { choreListServiceLive } from "../../data/domains/chore-list/service";
import { NAV_CORE } from "../../app/nav-core";

const errorMessages: Record<ErrorCode, string> = {
    catchAll: "Something went wrong",
    // TODO: deleting can never be a duplicate
    duplicate: "This item is a duplicate. Please contact support",
};

interface CompleteChoreListInitialState extends StandardFormSubmit {
    id: string;
}

export const completeChoreListServerAction = async (initialState: CompleteChoreListInitialState, _: FormData) => {
    const result = await Effect.runPromise(Effect.either(choreListServiceLive.pipe(Effect.flatMap(s => s.complete(initialState.id)))));

    return Either.match(result, {
        onLeft: e => ({
            ...initialState,
            error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
            status: "error" as FormStateStatus,
        }),
        onRight: chore => {
            revalidatePath(NAV_CORE.oneTime.byId(initialState.id));

            return {
                ...initialState,
                error: "",
                status: "success" as FormStateStatus,
                id: pipe(chore, O.match({ onNone: () => initialState.id, onSome: chore => chore.id })),
            };
        },
    });
};
