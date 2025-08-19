import * as O from "effect/Option";
import { Effect, pipe } from "effect";
import { cookies } from "next/headers";
import { stringIsUuid } from "../../../../data/domains/chore/service";
import { AppLink } from "../../../../components/app-link";
import { choreListServiceLive } from "../../../../data/domains/chore-list/service";
import { ChoreListDetail } from "../../../../components/choreList/detail";
import { NAV_CORE } from "../../../nav-core";

export interface ByIdProps {
    params: { id: string };
}

export default async function ChoreListById({ params: { id } }: ByIdProps) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("auth");
    const choreListById = await Effect.runPromise(
        choreListServiceLive.pipe(Effect.flatMap(service => pipe(id, stringIsUuid, service.getById(accessToken))))
    );

    return pipe(
        choreListById,
        O.match({
            onSome: choreList => <ChoreListDetail choreList={choreList} />,
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
