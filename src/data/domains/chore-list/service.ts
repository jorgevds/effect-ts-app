import { Context, Effect, Either, Layer, pipe } from "effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import * as E from "effect/Either";
import * as A from "effect/Array";
import { ChoreList, ChoreListFull, _choreList, _choreListFull } from "./types";
import { MalformedRequestError, ORM } from "../../orm";
import { retryPolicy } from "../../retry-policy";
import { ParseError } from "@effect/schema/ParseResult";
import { ORMError } from "../../ormError";
import { authenticationServiceLive } from "../authentication/service";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// model
export interface ChoreListService {
    readonly getAll: () => Effect.Effect<O.Option<ChoreList[]>, MalformedRequestError>;
    readonly create: (choreListSubmit: {
        name: string;
        chores: any[];
    }) => Effect.Effect<E.Either<ChoreList, ParseError | ORMError | MalformedRequestError>, ORMError | MalformedRequestError>;
    readonly getById: (
        token: RequestCookie | undefined
    ) => (id: Effect.Effect<string, ParseError, never>) => Effect.Effect<O.Option<ChoreList>, MalformedRequestError>;
    readonly delete: (id: string) => Effect.Effect<O.Option<ChoreList>, ORMError | MalformedRequestError>;
    readonly addChore: (
        id: string,
        chore: {
            name: string;
            estimationMinutes: number;
            location: string;
            timeInvalid: string;
        }
    ) => Effect.Effect<E.Either<ChoreList, ParseError | ORMError | MalformedRequestError>, ORMError | MalformedRequestError>;
    readonly complete: (id: string) => Effect.Effect<O.Option<ChoreList>, ORMError | MalformedRequestError>;
}

/** DO NOT CONSUME IN FEATURE CODE OR YOU WILL BE FIRED */
export const _ChoreListService = Context.GenericTag<ChoreListService>("@app/ChoreListService");

// Impl
const getAll = (orm: ORM["Type"]) =>
    Effect.tryPromise({
        try: () => orm.choreList.findMany({ include: { chores: { include: { location: true, performances: true } } } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const create = (orm: ORM["Type"], choreListSubmit: { name: string; chores: any[] }) =>
    Effect.tryPromise({
        try: () =>
            orm.choreList.create({
                data: {
                    name: choreListSubmit.name,
                },
                include: { chores: { include: { location: true } } },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const getById = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.choreList.findUnique({ where: { id }, include: { chores: { include: { location: true, performances: true } } } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const deleteChoreList = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.choreList.delete({ where: { id } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const completeChoreList = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.choreList.update({ where: { id }, data: { complete: true } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const addChore = (
    orm: ORM["Type"],
    id: string,
    chore: { name: string; estimationMinutes: number; location: string; timeInvalid: string }
) =>
    Effect.tryPromise({
        try: () =>
            orm.choreList.update({
                where: { id },
                data: {
                    chores: {
                        create: {
                            name: chore.name,
                            timeInvalid: chore.timeInvalid,
                            estimationMinutes: chore.estimationMinutes,
                            location: { connectOrCreate: { where: { name: chore.location }, create: { name: chore.location } } },
                        },
                    },
                },
                include: { chores: { include: { location: true, performances: true } } },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const mapper = (input: any): O.Option<ChoreList> => pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_choreList, { errors: "all" })));
const mapCreate = (input: any) => pipe(input, S.decodeEither(_choreListFull, { errors: "all" }));
const mapAddChore = (input: any) => pipe(input, S.decodeEither(_choreList, { errors: "all" }));

// Service
const make = (orm: ORM["Type"]): ChoreListService => ({
    getAll: () =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Fetching all chore lists`)),
                Effect.bind("nullableChoreLists", () => getAll(orm)),
                Effect.map(({ nullableChoreLists }) =>
                    nullableChoreLists.length === 0
                        ? O.none()
                        : O.some(nullableChoreLists.flatMap(choreList => A.fromOption(mapper(choreList))))
                )
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch all chore lists due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    create: (choreSubmit: { name: string; chores: any[] }) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Creating new chore list with name: ${choreSubmit.name}`)),
            Effect.bind("nullableNewChoreList", () => create(orm, choreSubmit)),
            Effect.mapBoth({
                onSuccess: ({ nullableNewChoreList }) => mapCreate(nullableNewChoreList),
                onFailure: e =>
                    Effect.runSync(
                        Effect.Do.pipe(
                            Effect.tap(() =>
                                Effect.logError(`Something went wrong when creating chore list with name: ${choreSubmit.name} - ${e}`)
                            ),
                            Effect.map(() => e)
                        )
                    ),
            })
        ),
    getById: token => id =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(async () => {
                    const validated = await Effect.runPromise(authenticationServiceLive.pipe(Effect.flatMap(s => s.validateAccess(token))));

                    return pipe(
                        validated,
                        Either.match({
                            onLeft: left => {
                                throw left;
                            },
                            onRight: () => {},
                        })
                    );
                }),
                Effect.bind("idEx", () => id),
                Effect.tap(({ idEx }) => Effect.logInfo(`Fetching chore list by id: ${idEx}`)),
                Effect.bind("nullableChoreListById", ({ idEx }) => getById(orm, idEx)),
                Effect.map(({ nullableChoreListById }) => mapper(nullableChoreListById))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch chore list by id: ${Effect.runSync(id)} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    delete: id =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Deleting chore list with id ${id}`)),
            Effect.bind("deletedChoreList", () => deleteChoreList(orm, id)),
            Effect.map(({ deletedChoreList }) => mapper(deletedChoreList))
        ),
    addChore: (id: string, choreSubmit: { name: string; estimationMinutes: number; location: string; timeInvalid: string }) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Adding new chore to list with id: ${id}`)),
            Effect.bind("nullableChoreList", () => addChore(orm, id, choreSubmit)),
            Effect.mapBoth({
                onSuccess: ({ nullableChoreList }) => mapAddChore(nullableChoreList),
                onFailure: e =>
                    Effect.runSync(
                        Effect.Do.pipe(
                            Effect.tap(() =>
                                Effect.logError(
                                    `Something went wrong when adding chore with name to list with id: ${choreSubmit.name} - ${id} - ${e}`
                                )
                            ),
                            Effect.map(() => e)
                        )
                    ),
            })
        ),
    complete: id =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Completing chore list with id ${id}`)),
            Effect.bind("completedChoreList", () => completeChoreList(orm, id)),
            Effect.map(({ completedChoreList }) => mapper(completedChoreList))
        ),
});
// DI
const choreService = Layer.effect(
    _ChoreListService,
    Effect.map(ORM, orm => _ChoreListService.of(make(orm)))
);

const mount = choreService.pipe(Layer.provide(Layer.sync(ORM, ORM.mount)));
export const choreListServiceLive = pipe(_ChoreListService, Effect.provide(mount));
