import { Effect, pipe } from "effect";

import * as O from "effect/Option";
import { authenticationServiceLive } from "../../data/domains/authentication/service";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Inauthenticated({ children }: { children: React.ReactNode }) {
    const cookieStorage = cookies();
    const token = cookieStorage.get("auth");
    const isValidated = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.validateAccess(token))));

    return pipe(
        isValidated,
        O.match({
            onNone: () => {
                redirect("/login");
            },
            onSome: _ => {
                return children;
            },
        })
    );
}
