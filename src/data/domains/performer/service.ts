import { Context, Effect, Layer, pipe } from "effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import * as A from "effect/Array";
import { Performer, PerformerFlat, _performer, _performerPerformanceLess } from "./types";
import { MalformedRequestError, ORM } from "../../orm";
import { ORMError } from "../../ormError";
import { ParseError } from "@effect/schema/ParseResult";
import { retryPolicy } from "../../retry-policy";

// model
export interface PerformerService {
    readonly parsePerformerId: (performer: O.Option<Performer>) => Effect.Effect<string, ParseError, never>;
    readonly getById: (id: Effect.Effect<string, ParseError, never>) => Effect.Effect<O.Option<Performer>, MalformedRequestError>;
    readonly getByEmail: (email: string) => Effect.Effect<O.Option<PerformerFlat>, MalformedRequestError>;
    readonly getAll: () => Effect.Effect<O.Option<Performer[]>, MalformedRequestError>;
    readonly delete: (id: string) => Effect.Effect<O.Option<Performer>, ORMError | MalformedRequestError>;
    readonly create: (performerSubmit: {
        name: string;
        email: string;
        password: string;
    }) => Effect.Effect<O.Option<Performer>, ORMError | MalformedRequestError>;
}
/** DO NOT CONSUME IN FEATURE CODE OR YOU WILL BE FIRED */
export const _PerformerService = Context.GenericTag<PerformerService>("@app/PerformerService");

const mapper = (input: any): O.Option<Performer> => pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_performer, { errors: "all" })));
const mapperFlat = (input: any): O.Option<PerformerFlat> =>
    pipe(O.fromNullable(input), O.flatMap(S.decodeOption(_performerPerformanceLess, { errors: "all" })));
// Impl
const getById = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.user.findUnique({ where: { id }, include: { performances: true } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const getByEmail = (orm: ORM["Type"], email: string) =>
    Effect.tryPromise({
        try: () => orm.user.findUnique({ where: { email } }),
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

const create = (orm: ORM["Type"], performerSubmit: { name: string; email: string; password: string }) =>
    Effect.tryPromise({
        try: () =>
            orm.user.create({
                data: {
                    name: performerSubmit.name,
                    email: performerSubmit.email,
                    password: performerSubmit.password,
                    performances: {},
                },
                include: { performances: true },
            }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

const deletePerformer = (orm: ORM["Type"], id: string) =>
    Effect.tryPromise({
        try: () => orm.user.delete({ where: { id } }),
        catch: e => ORM.ormError(e).pipe(O.getOrElse(() => new MalformedRequestError({ error: e }))),
    });

// Service
const make = (orm: ORM["Type"]): PerformerService => ({
    getById: id =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.bind("idEx", () => id),
                Effect.tap(({ idEx }) => Effect.logInfo(`Fetching performer by id: ${idEx}`)),
                Effect.bind("nullablePerformerById", ({ idEx }) => getById(orm, idEx)),
                Effect.map(({ nullablePerformerById }) => mapper(nullablePerformerById))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch performer by id: ${Effect.runSync(id)} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    getByEmail: email =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Fetching performer by email: ${email}`)),
                Effect.bind("nullablePerformerByEmail", () => getByEmail(orm, email)),
                Effect.tap(() => Effect.logInfo(`Mapping performer by email: ${email}`)),
                Effect.map(({ nullablePerformerByEmail }) => mapperFlat(nullablePerformerByEmail))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch performer by email: ${email} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    getAll: () =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Fetching all performers`)),
                Effect.bind("nullablePerformers", () => getAll(orm)),
                Effect.map(({ nullablePerformers }) =>
                    nullablePerformers.length === 0
                        ? O.none()
                        : O.some(nullablePerformers.flatMap(performer => A.fromOption(mapper(performer))))
                )
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to fetch all performers due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    parsePerformerId: performer =>
        pipe(
            performer,
            O.match({
                onSome: ch => pipe(ch.id, S.encode(S.UUID)),
                onNone: () => pipe("", S.encode(S.UUID)),
            })
        ),
    create: (performerSubmit: { name: string; email: string; password: string }) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Creating new performer with values: ${JSON.stringify(performerSubmit)}`)),
            Effect.bind("nullableNewPerformer", () => create(orm, performerSubmit)),
            Effect.mapBoth({
                onSuccess: ({ nullableNewPerformer }) => mapper(nullableNewPerformer),
                onFailure: e =>
                    Effect.runSync(
                        Effect.Do.pipe(
                            Effect.tap(() =>
                                Effect.logError(`Something went wrong when creating performer with name: ${performerSubmit.name} - ${e}`)
                            ),
                            Effect.map(() => e)
                        )
                    ),
            })
        ),
    delete: id =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo(`Deleting performer with id ${id}`)),
            Effect.bind("deletedPerformer", () => deletePerformer(orm, id)),
            Effect.map(({ deletedPerformer }) => mapper(deletedPerformer))
        ),
});
// DI
const performerService = Layer.effect(
    _PerformerService,
    Effect.map(ORM, orm => _PerformerService.of(make(orm)))
);

const mount = performerService.pipe(Layer.provide(Layer.sync(ORM, ORM.mount)));
export const performerServiceLive = pipe(_PerformerService, Effect.provide(mount));
