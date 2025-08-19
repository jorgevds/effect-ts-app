import * as O from "effect/Option";

import { Effect, pipe } from "effect";

import { AppLink } from "../../../components/app-link";
import { choreListServiceLive } from "../../../data/domains/chore-list/service";
import { NAV_CORE } from "../../nav-core";

export default async function Home() {
    const allChores = await Effect.runPromise(choreListServiceLive.pipe(Effect.flatMap(s => s.getAll())));

    return pipe(
        allChores,
        O.match({
            onSome: choreLists => (
                <>
                    <div className="pt-3">
                        Click <AppLink href={NAV_CORE.oneTime.add()}>here</AppLink> to create a chore list
                    </div>
                    {choreLists.map(list => (
                        <div className="py-4" key={list.id}>
                            <AppLink href={NAV_CORE.oneTime.byId(list.id)}>{list.name}</AppLink>
                        </div>
                    ))}
                </>
            ),
            onNone: () => (
                <div className="flex flex-col">
                    <div className="pt-32 m-auto">
                        <h2 className="text-xl italic">Looks like you don't have any chore lists yet (lucky)</h2>
                        <div className="pt-3">
                            Click <AppLink href={NAV_CORE.oneTime.add()}>here</AppLink> to create a chore list
                        </div>
                    </div>
                </div>
            ),
        })
    );
}
