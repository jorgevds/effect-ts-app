"use server";

import { Effect, Either } from "effect";

import { ErrorCode, ORMError } from "../../data/ormError";
import { revalidatePath } from "next/cache";
import { StandardFormSubmit } from "../types";
import { choreListServiceLive } from "../../data/domains/chore-list/service";
import { NAV_CORE } from "../../app/nav-core";

const errorMessages: Record<ErrorCode, string> = {
    catchAll: "Something went wrong",
    duplicate: "Please pass in a unique name or location",
};

interface AddChoreListInitialState extends StandardFormSubmit {
    id: string;
}

export const addChoreToListSA = async (initialState: AddChoreListInitialState, data: FormData): Promise<AddChoreListInitialState> => {
    const choreListId = initialState.id;

    const name = data.get("chore")?.toString() ?? "";
    const location = data.get("location")?.toString() ?? "";
    const estimationMinutes = data.get("estimatedTime")?.toString() ?? "";
    // We don't care about repeating the chore
    const timeInvalid = "1970-01-01T00:00:00.000Z";

    const result = await Effect.runPromise(
        choreListServiceLive.pipe(
            Effect.flatMap(s =>
                s.addChore(choreListId, { name, location, estimationMinutes: parseInt(estimationMinutes, 10), timeInvalid })
            )
        )
    );

    return Either.match(result, {
        onLeft: e => ({
            ...initialState,
            error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
            status: "error",
        }),
        onRight: choreList => {
            revalidatePath(NAV_CORE.oneTime.byId(choreListId));

            return {
                status: "success",
                id: choreList.id,
            };
        },
    });
};
