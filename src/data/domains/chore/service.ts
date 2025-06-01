import { Chore as ORMChore, Location as ORMLocation, Performance as ORMPerformance, User as ORMPerformer } from "@prisma/client";
import { Context, Effect, Layer, pipe, Either } from "effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import * as A from "effect/Array";
import { Chore, ChoreFull, _chore, _choreFull } from "./types";
import { MalformedRequestError, ORM } from "../../orm";
import { ParseError } from "@effect/schema/ParseResult";
import { retryPolicy } from "../../retry-policy";
import { addDays } from "date-fns";
import { ORMError } from "../../ormError";
import { authenticationServiceLive } from "../authentication/service";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AuthenticationError } from "../authentication/authenticationError";
import { PerformerFlat } from "../performer/types";
import { PerformancePerformerLess } from "../performance/types";

// model
export interface ChoreService {
    readonly parseChoreId: (chore: O.Option<Chore>) => Effect.Effect<string, ParseError, never>;
    readonly getById: (
        token: RequestCookie | undefined
    ) => (id: Effect.Effect<string, ParseError, never>) => Effect.Effect<O.Option<ChoreFull>, MalformedRequestError>;
    readonly deleteChore: (id: string) => Effect.Effect<O.Option<Chore>, ORMError | MalformedRequestError>;
    readonly getAll: () => Effect.Effect<O.Option<Chore[]>, MalformedRequestError>;
    readonly create: (choreSubmit: {
        name: string;
        estimationMinutes: number;
        location: string;
        timeInvalid: string;
    }) => Effect.Effect<O.Option<Chore>, ORMError | MalformedRequestError>;
    readonly complete: (choreSubmit: {
        choreId: string;
        performerId: string;
    }) => Effect.Effect<O.Option<Chore>, ORMError | MalformedRequestError>;
}
/** DO NOT CONSUME IN FEATURE CODE OR YOU WILL BE FIRED */
export const _ChoreService = Context.GenericTag<ChoreService>("@app/ChoreService");

const mapper = (input: ORMChore & { location: ORMLocation } & { performances: PerformancePerformerLess[] }): O.Option<Chore> =>
    pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_chore, { errors: "all" })));
const fullMapper = (input: any): O.Option<ChoreFull> =>
    pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_choreFull, { errors: "all" })));
// Impl
const getById = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.chore.findUnique({ where: { id }, include: { location: true, performances: { include: { performer: true } } } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const getAll = (orm: ORM["Type"]) =>
    Effect.tryPromise({
        try: () =>
            orm.chore.findMany({
                include: { location: true, performances: true },
                orderBy: [{ location: { name: "asc" } }],
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const create = (orm: ORM["Type"], choreSubmit: { name: string; estimationMinutes: number; location: string; timeInvalid: string }) =>
    Effect.tryPromise({
        try: () =>
            orm.chore.create({
                data: {
                    name: choreSubmit.name,
                    estimationMinutes: choreSubmit.estimationMinutes,
                    timeInvalid: new Date(choreSubmit.timeInvalid),
                    location: { connectOrCreate: { where: { name: choreSubmit.location }, create: { name: choreSubmit.location } } },
                },
                include: { location: true, performances: true },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const deleteChore = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.chore.delete({ where: { id } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });
const complete = (orm: ORM["Type"], choreSubmit: { choreId: string; performerId: string }) =>
    Effect.tryPromise({
        try: () =>
            orm.chore.update({
                where: { id: choreSubmit.choreId },
                data: {
                    performances: { create: { timePerformed: new Date(), minutesPerformed: 15, performerId: choreSubmit.performerId } },
                    timeInvalid: addDays(new Date(), 7),
                },
                include: { location: true, performances: { include: { performer: true } } },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

// Service
const make = (orm: ORM["Type"]): ChoreService => ({
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
                Effect.tap(({ idEx }) => Effect.logInfo(`Fetching chore by id: ${idEx}`)),
                Effect.bind("nullableChoreById", ({ idEx }) => getById(orm, idEx)),
                Effect.tap(({ idEx }) => Effect.logInfo(`Mapping chore by id: ${idEx}`)),
                Effect.map(({ nullableChoreById }) => fullMapper(nullableChoreById))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch chore by id: ${Effect.runSync(id)} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    getAll: () =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Fetching all chores`)),
                Effect.bind("nullableChores", () => getAll(orm)),
                Effect.map(({ nullableChores }) =>
                    nullableChores.length === 0 ? O.none() : O.some(nullableChores.flatMap(chore => A.fromOption(mapper(chore))))
                )
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch all chores due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    parseChoreId: chore =>
        pipe(
            chore,
            O.match({
                onSome: ch => pipe(ch.id, S.encode(S.UUID)),
                onNone: () => pipe("", S.encode(S.UUID)),
            })
        ),
    create: (choreSubmit: { name: string; estimationMinutes: number; location: string; timeInvalid: string }) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Creating new chore with values: ${JSON.stringify(choreSubmit)}`)),
            Effect.bind("nullableNewChore", () => create(orm, choreSubmit)),
            Effect.mapBoth({
                onSuccess: ({ nullableNewChore }) => mapper(nullableNewChore),
                onFailure: e =>
                    Effect.runSync(
                        Effect.Do.pipe(
                            Effect.tap(() =>
                                Effect.logError(
                                    `Something went wrong when creating chore with name - location: ${choreSubmit.name} - ${choreSubmit.location} - ${e}`
                                )
                            ),
                            Effect.map(() => e)
                        )
                    ),
            })
        ),
    deleteChore: id =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Deleting chore with id ${id}`)),
            Effect.bind("deletedChore", () => deleteChore(orm, id)),
            Effect.map(({ deletedChore }) => mapper(deletedChore))
        ),
    complete: choreSubmit =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() =>
                    Effect.logInfo(`Completing chore with id: ${choreSubmit.choreId} by performer ${choreSubmit.performerId}`)
                ),
                Effect.bind("nullableChoreById", () => complete(orm, choreSubmit)),
                Effect.map(({ nullableChoreById }) => fullMapper(nullableChoreById))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to complete chore with id: ${choreSubmit.choreId} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
});
// DI
const choreService = Layer.effect(
    _ChoreService,
    Effect.map(ORM, orm => _ChoreService.of(make(orm)))
);

const mount = choreService.pipe(Layer.provide(Layer.sync(ORM, ORM.mount)));
export const choreServiceLive = pipe(_ChoreService, Effect.provide(mount));
