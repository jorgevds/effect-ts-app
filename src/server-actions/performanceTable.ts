"use server";

import * as O from "effect/Option";
import { Effect, Either, pipe } from "effect";

import { revalidatePath } from "next/cache";
import { performanceServiceLive } from "../data/domains/performance/service";
import { FormStateStatus } from "./createChore";
import { ErrorCode, ORMError } from "../data/ormError";
import { FormToastable } from "../components/formToast";

interface PerformanceTableFormSubmit extends FormToastable {
    choreId: string;
}

export const performancesTableServerAction = async (initialState: PerformanceTableFormSubmit, data: FormData) => {
    const id = data.get("id")?.toString() ?? "";
    const action = data.get("action")?.toString() ?? "";

    if (action === "deletePerformance") {
        const result = await Effect.runPromise(Effect.either(performanceServiceLive.pipe(Effect.flatMap(s => s.delete(id)))));

        const errorMessages: Record<ErrorCode, string> = {
            duplicate: "This performance is a duplicate. Please contact support",
            catchAll: "Something went wrong deleting this performance",
        };

        return Either.match(result, {
            onLeft: e => ({
                ...initialState,
                error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
                status: "error" as FormStateStatus,
            }),
            onRight: performance => {
                revalidatePath(`/chore/${initialState.choreId}`);

                return {
                    ...initialState,
                    error: "",
                    status: "success" as FormStateStatus,
                    success: "Successfully deleted performance",
                    id: pipe(performance, O.match({ onNone: () => "", onSome: perf => perf.id })),
                };
            },
        });
    }

    return { ...initialState, status: "error" as FormStateStatus, error: "No action submitted. Returning noop." };
};
