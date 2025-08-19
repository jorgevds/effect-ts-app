"use server";

import { Effect, Either } from "effect";

import { choreServiceLive } from "../data/domains/chore/service";
import { ErrorCode, ORMError } from "../data/ormError";
import { revalidatePath } from "next/cache";
import { FormState } from "./types";

export const createChoreSA = async (initialState: FormState, data: FormData): Promise<FormState> => {
    const name = data.get("chore")?.toString() ?? "";
    const location = data.get("location")?.toString() ?? "";
    const estimationMinutes = data.get("estimatedTime")?.toString() ?? "";
    // Timeframe in which a chore should happen again in days, e.g. 7 days means a chore is a weekly chore
    const timeInvalid = data.get("timeInvalid")?.toString() ?? "";

    const result = await Effect.runPromise(
        choreServiceLive.pipe(
            Effect.flatMap(s => s.create({ name, location, estimationMinutes: parseInt(estimationMinutes, 10), timeInvalid }))
        )
    );

    const errorMessages: Record<ErrorCode, string> = {
        catchAll: "Something went wrong",
        duplicate: "Please pass in a unique name or location",
    };

    return Either.match(result, {
        onLeft: e => ({
            ...initialState,
            error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
            status: "error",
        }),
        onRight: chore => {
            revalidatePath("/");

            return {
                status: "success",
                choreId: chore.id,
            };
        },
    });
};
