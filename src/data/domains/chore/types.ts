import * as Arbitrary from "@effect/schema/Arbitrary";
import * as S from "@effect/schema/Schema";
import * as fc from "fast-check";
import { _performer, _performerPerformanceLess } from "../performer/types";
import { _performance, _performanceUserLess } from "../performance/types";

export const _chore = S.Struct({
    id: S.UUID,
    name: S.String,
    location: S.suspend(() => _location),
    locationId: S.NullOr(S.UUID),
    performances: S.suspend(() => S.Array(_performanceUserLess)),
    performanceId: S.NullOr(S.UUID),
    instructionId: S.NullOr(S.UUID),
    timeInvalid: S.DateFromSelf.pipe(S.validDate()),
    estimationMinutes: S.Number.pipe(S.int(), S.positive()),
});

export const _choreFull = S.Struct({
    ..._chore.fields,
    performances: S.suspend(() => S.Array(_performance)),
});

export const randomChore = () => {
    const a = Arbitrary.make(_chore);
    const toFc = fc.sample(a, 1);
    return toFc[0];
};

const _location = S.Struct({
    id: S.UUID,
    name: S.String,
    choreId: S.optional(S.UUID),
});

export interface Chore extends S.Schema.Type<typeof _chore> {}
export interface ChoreFull extends S.Schema.Type<typeof _choreFull> {}

export interface Location extends S.Schema.Type<typeof _location> {}
