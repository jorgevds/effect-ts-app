import { Effect, pipe, Either } from "effect";

import { authenticationServiceLive } from "../data/domains/authentication/service";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Inauthenticated() {
    const cookieStorage = cookies();
    const token = cookieStorage.get("auth");
    const isValidated = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.validateAccess(token))));

    return pipe(
        isValidated,
        Either.match({
            onLeft: () => {
                redirect("/landing");
            },
            onRight: _ => {
                console.log("home redirect", _);
                redirect("/home");
            },
        })
    );
}
