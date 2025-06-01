import * as O from "effect/Option";

import { Effect, pipe } from "effect";

import { choreServiceLive } from "../../../data/domains/chore/service";

import { AppLink } from "../../../components/link";
import { ChoresOverview } from "../../../components/chore/overview";

export default async function Home() {
    const allChores = await Effect.runPromise(choreServiceLive.pipe(Effect.flatMap(s => s.getAll())));

    return pipe(
        allChores,
        O.match({
            onSome: chores => <ChoresOverview chores={chores} />,
            onNone: () => (
                <div className="flex flex-col">
                    <div className="pt-32 m-auto">
                        <h2 className="text-xl italic">Looks like you don't have any chores yet (lucky)</h2>
                        <div className="pt-3">
                            Click <AppLink href="/add">here</AppLink> to add chores
                        </div>
                    </div>
                </div>
            ),
        })
    );
}
