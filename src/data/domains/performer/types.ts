import * as S from "@effect/schema/Schema";
import { _performanceUserLess } from "../performance/types";

export const _performerPerformanceLess = S.Struct({
    id: S.UUID,
    email: S.String,
    name: S.String,
    password: S.optional(S.String),
});
export const _performer = S.Struct({
    ..._performerPerformanceLess.fields,
    performances: S.suspend(() => S.Array(_performanceUserLess)),
});

export interface Performer extends S.Schema.Type<typeof _performer> {}
export interface PerformerFlat extends S.Schema.Type<typeof _performerPerformanceLess> {}
