import { Context, Effect, Layer, pipe } from "effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import * as A from "effect/Array";
import { Performance, _performance } from "./types";
import { MalformedRequestError, ORM } from "../../orm";
import { ParseError } from "@effect/schema/ParseResult";
import { retryPolicy } from "../../retry-policy";
import { ORMError } from "../../ormError";

// model
export interface PerformanceService {
    readonly parsePerformanceId: (performance: O.Option<Performance>) => Effect.Effect<string, ParseError, never>;
    readonly getById: (id: Effect.Effect<string, ParseError, never>) => Effect.Effect<O.Option<Performance>, MalformedRequestError>;
    readonly getAll: () => Effect.Effect<O.Option<Performance[]>, MalformedRequestError>;
    readonly delete: (id: string) => Effect.Effect<O.Option<Performance>, ORMError | MalformedRequestError>;
    readonly create: (performanceSubmit: {
        name: string;
        email: string;
    }) => Effect.Effect<O.Option<Performance>, ORMError | MalformedRequestError>;
}
/** DO NOT CONSUME IN FEATURE CODE OR YOU WILL BE FIRED */
export const _PerformanceService = Context.GenericTag<PerformanceService>("@app/PerformanceService");

const mapper = (input: any): O.Option<Performance> =>
    pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_performance, { errors: "all" })));
// Impl
const getById = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.user.findUnique({ where: { id }, include: { performances: true } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const getAll = (orm: ORM["Type"]) =>
    Effect.tryPromise({
        try: () =>
            orm.user.findMany({
                include: { performances: true },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const create = (orm: ORM["Type"], performanceSubmit: { name: string; email: string }) =>
    Effect.tryPromise({
        try: () =>
            orm.user.create({
                data: {
                    name: performanceSubmit.name,
                    email: performanceSubmit.email,
                    performances: {},
                },
                include: { performances: true },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const deletePerformance = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.performance.delete({ where: { id } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

// Service
const make = (orm: ORM["Type"]): PerformanceService => ({
    getById: id =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.bind("idEx", () => id),
                Effect.tap(({ idEx }) => Effect.logInfo(`Fetching performance by id: ${idEx}`)),
                Effect.bind("nullablePerformanceById", ({ idEx }) => getById(orm, idEx)),
                Effect.map(({ nullablePerformanceById }) => mapper(nullablePerformanceById))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch performance by id: ${Effect.runSync(id)} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    getAll: () =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Fetching all performances`)),
                Effect.bind("nullablePerformances", () => getAll(orm)),
                Effect.map(({ nullablePerformances }) =>
                    nullablePerformances.length === 0
                        ? O.none()
                        : O.some(nullablePerformances.flatMap(performance => A.fromOption(mapper(performance))))
                )
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch all performances due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    parsePerformanceId: performance =>
        pipe(
            performance,
            O.match({
                onSome: ch => pipe(ch.id, S.encode(S.UUID)),
                onNone: () => pipe("", S.encode(S.UUID)),
            })
        ),
    create: (performanceSubmit: { name: string; email: string }) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Creating new performance with values: ${JSON.stringify(performanceSubmit)}`)),
            Effect.bind("nullableNewPerformance", () => create(orm, performanceSubmit)),
            Effect.mapBoth({
                onSuccess: ({ nullableNewPerformance }) => mapper(nullableNewPerformance),
                onFailure: e =>
                    Effect.runSync(
                        Effect.Do.pipe(
                            Effect.tap(() =>
                                Effect.logError(
                                    `Something went wrong when creating performance with name: ${performanceSubmit.name} - ${e}`
                                )
                            ),
                            Effect.map(() => e)
                        )
                    ),
            })
        ),
    delete: id =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Deleting performance with id ${id}`)),
            Effect.bind("deletedPerformance", () => deletePerformance(orm, id)),
            Effect.map(({ deletedPerformance }) => mapper(deletedPerformance))
        ),
});
// DI
const performanceService = Layer.effect(
    _PerformanceService,
    Effect.map(ORM, orm => _PerformanceService.of(make(orm)))
);

const mount = performanceService.pipe(Layer.provide(Layer.sync(ORM, ORM.mount)));
export const performanceServiceLive = pipe(_PerformanceService, Effect.provide(mount));
