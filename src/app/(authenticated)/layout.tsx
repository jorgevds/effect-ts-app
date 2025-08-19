import { Effect, pipe, Either } from "effect";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authenticationServiceLive } from "../../data/domains/authentication/service";
import { ChoreToggleGroup } from "../../components/chore/choreToggleGroup";
import { NAV_CORE } from "../nav-core";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const cookieStorage = cookies();
    const token = cookieStorage.get("auth");
    const isValidated = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.validateAccess(token))));

    return pipe(
        isValidated,
        Either.match({
            onLeft: _ => {
                redirect(NAV_CORE.login);
            },
            onRight: _ => (
                <div className="flex flex-col w-full h-full">
                    <ChoreToggleGroup />
                    {children}
                </div>
            ),
        })
    );
}
