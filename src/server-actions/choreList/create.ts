"use server";

import { Effect, Either, pipe } from "effect";

import { choreListServiceLive } from "../../data/domains/chore-list/service";
import { ErrorCode, ORMError } from "../../data/ormError";
import { revalidatePath } from "next/cache";
import { ChoreList } from "../../data/domains/chore-list/types";
import { ParseError } from "@effect/schema/ParseResult";
import { MalformedRequestError } from "../../data/orm";
import { FormStateStatus } from "../types";
import { FormToastable } from "../../components/toast/formToast";

const errorMessages: Record<ErrorCode, string> = {
    catchAll: "Something went wrong",
    duplicate: "Please pass in a unique name or location",
};

const applyEither = (initialState: CreateChoreListState, result: Either.Either<ChoreList, ORMError | ParseError | MalformedRequestError>) =>
    pipe(
        result,
        Either.mapBoth({
            onLeft: e => ({
                ...initialState,
                error: e instanceof ORMError ? errorMessages[e.parseCode] : errorMessages["catchAll"],
                status: "error",
            }),
            onRight: choreList => {
                revalidatePath("/");

                return {
                    status: "success" as FormStateStatus,
                    choreListId: choreList.id,
                };
            },
        })
    );

export interface CreateChoreListState extends FormToastable {
    choreListId?: string;
}

export const createChoreListSA = async (initialState: CreateChoreListState, data: FormData): Promise<CreateChoreListState> => {
    return Effect.runPromise(
        Effect.Do.pipe(
            Effect.bind("result", () =>
                choreListServiceLive.pipe(Effect.flatMap(s => s.create({ name: data.get("name")?.toString() ?? "", chores: [] })))
            ),
            Effect.flatMap(({ result }) => applyEither(initialState, result))
        )
    );
};
