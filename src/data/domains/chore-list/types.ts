import * as Arbitrary from "@effect/schema/Arbitrary";
import * as S from "@effect/schema/Schema";
import * as fc from "fast-check";
import { _chore, _choreFull } from "../chore/types";

export const _choreList = S.Struct({
    id: S.UUID,
    name: S.String,
    // TODO: this line and Chore[] are not the same
    chores: S.suspend(() => S.Array(_chore)),
    complete: S.Boolean,
});

export const _choreListFull = S.Struct({
    ..._choreList.fields,
    chores: S.suspend(() => S.Array(_choreFull)),
});

export const randomChore = () => {
    const a = Arbitrary.make(_choreList);
    const toFc = fc.sample(a, 1);
    return toFc[0];
};

export interface ChoreList extends S.Schema.Type<typeof _choreList> {}
export interface ChoreListFull extends S.Schema.Type<typeof _choreListFull> {}
