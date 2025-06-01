"use server";

import { Effect, Either, pipe } from "effect";
import { ErrorCode } from "../data/ormError";
import { cookies } from "next/headers";
import { FormStateStatus } from "./createChore";
import { authenticationServiceLive } from "../data/domains/authentication/service";
import { Password } from "../data/domains/authentication/types";

export const login = async (initialState: { status: FormStateStatus; error?: string }, values: FormData) => {
    const email = values.get("email")?.toString() ?? "";
    const password: Password = (values.get("password")?.toString() as Password) ?? ("" as Password);

    const result = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.login({ email, password }))));

    const errorMessages: Record<ErrorCode, string> = {
        catchAll: "Something went wrong",
        duplicate: "This item is a duplicate. Please contact support", // TODO
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
            onRight: value => {
                cookies().set({
                    name: "auth",
                    value,
                    httpOnly: true,
                    secure: true,
                    sameSite: true,
                    maxAge: 60 * 60 * 24, // minutes
                });

                return { ...initialState, error: "", status: "success" as FormStateStatus };
            },
        })
    );
};
