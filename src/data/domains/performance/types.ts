import * as S from "@effect/schema/Schema";
import { _performer, _performerPerformanceLess } from "../performer/types";

export const _performanceUserLess = S.Struct({
    id: S.UUID,
    minutesPerformed: S.Number.pipe(S.int(), S.positive()),
    timePerformed: S.DateFromSelf.pipe(S.validDate()),
    choreId: S.optional(S.UUID),
    performerId: S.NullOr(S.String),
});
export const _performance = S.Struct({
    ..._performanceUserLess.fields,
    performer: S.suspend(() => _performerPerformanceLess),
});

export interface Performance extends S.Schema.Type<typeof _performance> {}
export interface PerformancePerformerLess extends S.Schema.Type<typeof _performanceUserLess> {}
