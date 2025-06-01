import * as O from "effect/Option";
import * as S from "@effect/schema/Schema";
import { Effect, flow, pipe } from "effect";
import { choreServiceLive } from "../../../../data/domains/chore/service";
import { AppLink } from "../../../../components/link";
import { MalformedRequestError } from "../../../../data/orm";
import { ChoreDetail } from "../../../../components/chore/detail";
import { cookies } from "next/headers";

const stringIsUuid = flow(
    S.encode(S.UUID),
    Effect.catchAll(() => Effect.succeed(new MalformedRequestError({ error: "" })))
);

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
                            <AppLink href="/">Get back</AppLink> to the action
                        </div>
                    </div>
                </div>
            ),
        })
    );
}
