import Link from "next/link";

import { Effect, Either, pipe } from "effect";

import { authenticationServiceLive } from "../../data/domains/authentication/service";
import { NAV_CORE } from "../../app/nav-core";
import { HeaderMenuItems } from "./header-menu-items";
import { HeaderMenu } from "./header-menu";
import { cookies } from "next/headers";

export const Header = async () => {
    const cookieStorage = cookies();
    const token = cookieStorage.get("auth");
    // TODO: rethink impl
    // TODO: this is being called multiple times now; could lift state up and pass Either to props
    const isValidated = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.validateAccess(token))));
    const user = pipe(isValidated, Either.match({ onLeft: _ => null, onRight: payload => payload }));

    return (
        <header className="h-16 border-b border-b-black bg-white text-black">
            <div className="flex h-full px-4 container mx-auto">
                <div className="flex justify-between items-center flex-1">
                    <h1 className="font-semibold text-3xl">
                        <Link href={NAV_CORE.base} scroll={false}>
                            Chore world
                        </Link>
                    </h1>
                    <ul className="flex items-center">
                        <HeaderMenu>
                            <HeaderMenuItems user={user} />
                        </HeaderMenu>
                    </ul>
                </div>
            </div>
        </header>
    );
};
