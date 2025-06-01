"use server";

import { Effect, Either, pipe } from "effect";
import { revalidatePath } from "next/cache";
import { choreServiceLive } from "../data/domains/chore/service";
import { FormStateStatus } from "./createChore";
import { ErrorCode } from "../data/ormError";

const userId = "dd2c3b8a-ab82-46e7-9999-36d4936a122b";

export const completeChoreServerAction = async (initialState: { id: string; status: FormStateStatus; error?: string }, data: FormData) => {
    const { id } = initialState;

    // TODO: keep error info from service
    const result = await Effect.runPromise(choreServiceLive.pipe(Effect.flatMap(s => s.complete({ choreId: id, performerId: userId }))));

    const errorMessages: Record<ErrorCode, string> = {
        catchAll: "Something went wrong",
        duplicate: "This item is a duplicate. Please contact support",
    };

    return pipe(
        result,
        Either.fromOption(() => errorMessages["catchAll"]),
        Either.match({
            onLeft: e => ({
                ...initialState,
                error: e,
                status: "error" as FormStateStatus,
            }),
            onRight: _ => {
                revalidatePath(`chore/${id}`);
                return { ...initialState, error: "", status: "success" as FormStateStatus };
            },
        })
    );
};
