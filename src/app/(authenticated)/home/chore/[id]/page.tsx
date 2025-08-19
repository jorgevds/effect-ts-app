import * as O from "effect/Option";
import { Effect, pipe } from "effect";
import { choreServiceLive, stringIsUuid } from "../../../../../data/domains/chore/service";
import { AppLink } from "../../../../../components/app-link";
import { ChoreDetail } from "../../../../../components/chore/detail";
import { cookies } from "next/headers";
import { NAV_CORE } from "../../../../nav-core";

export default async function ChoreDetailPage({ params: { id } }: { params: { id: string } }) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("auth");
    const choreById = await Effect.runPromise(
        choreServiceLive.pipe(Effect.flatMap(service => pipe(id, stringIsUuid, service.getById(accessToken))))
    );

    return pipe(
        choreById,
        O.match({
            onSome: chore => <ChoreDetail chore={chore} />,
            onNone: () => (
                <div className="flex flex-col">
                    <div className="pt-32 m-auto">
                        <h2 className="text-xl italic">Looks like you got lost</h2>
                        <div className="pt-3">
                            <AppLink href={NAV_CORE.base}>Get back</AppLink> to the action
                        </div>
                    </div>
                </div>
            ),
        })
    );
}
