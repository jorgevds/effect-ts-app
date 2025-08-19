import { Context, Effect, Layer, pipe, Either } from "effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import bcrypt from "bcryptjs";
import { Password, PasswordHashError } from "./types";
import { MalformedRequestError } from "../../orm";
import { retryPolicy } from "../../retry-policy";

import { compose } from "effect/Function";
import { PasswordParseError, passwordSchema } from "./types";
import { Performer, PerformerFlat } from "../performer/types";
import { performerServiceLive } from "../performer/service";
import { KeyObject, createSecretKey } from "crypto";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AuthenticationError } from "./authenticationError";

export const parsePassword = compose(
    S.decodeUnknown(passwordSchema),
    Effect.mapError(cause => new PasswordParseError({ cause }))
);
const SALT_ROUNDS = 4;

const hashPassword = (password: Password) => {
    return pipe(
        Effect.tryPromise(() => bcrypt.hash(password, SALT_ROUNDS)),
        Effect.mapError(() => new PasswordHashError())
    );
};

const comparePasswords = ({ plainText, hashValue }: { plainText: string; hashValue: string }) => {
    return Effect.tryPromise({
        try: () => bcrypt.compare(plainText, hashValue),
        catch: () => new PasswordHashError(),
    });
};
// model
export interface AuthenticationService {
    readonly signup: (signup: {
        name: string;
        email: string;
        password: Password;
    }) => Effect.Effect<O.Option<Performer>, PasswordParseError, never>;
    readonly login: (login: {
        email: string;
        password: Password;
    }) => Effect.Effect<O.Option<string>, PasswordParseError | MalformedRequestError>;
    // readonly forgetPassword: (id: Effect.Effect<string, ParseError, never>) => Effect.Effect<O.Option<Performer>, MalformedRequestError>;
    readonly validateAccess: (
        token: RequestCookie | undefined
    ) => Effect.Effect<Either.Either<CustomJwt & JWTPayload, AuthenticationError>>;
}
/** DO NOT CONSUME IN FEATURE CODE OR YOU WILL BE FIRED */
export const _AuthenticationService = Context.GenericTag<AuthenticationService>("@app/PerformerService");

// impl
const secretKey = () => createSecretKey(process.env.AUTH_SECRET ?? "", "utf-8");

const createAccessToken = (secret: KeyObject) => async (user: PerformerFlat) =>
    new SignJWT({ id: user.id, name: user.name, email: user.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("http://localhost")
        .setAudience("http://localhost")
        .setExpirationTime("1 day")
        .sign(secret);

export interface CustomJwt {
    id: string;
    name: string;
    email: string;
}

const verifyAccessToken = (secret: KeyObject) => async (token: string) => {
    const { payload } = await jwtVerify<CustomJwt>(token, secret, {
        issuer: "http://localhost",
        audience: "http://localhost",
    });
    return payload;
};

// Service
const make = (): AuthenticationService => ({
    signup: (signup: { name: string; email: string; password: Password }) =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Signing up user: ${signup.email}`)),
                Effect.bind("password", () => hashPassword(signup.password)),
                Effect.bind("user", ({ password }) => performerServiceLive.pipe(Effect.flatMap(s => s.create({ ...signup, password })))),
                Effect.map(({ user }) => user)
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logError(`Failed to sign up user by email: ${signup.email} due to error: ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
    validateAccess: (token: RequestCookie | undefined) =>
        Effect.Do.pipe(
            Effect.tap(() => Effect.logInfo("Checking access token")),
            Effect.bind("verified", () =>
                Effect.promise(async () => {
                    try {
                        const validated = await pipe(token?.value ?? "", verifyAccessToken(secretKey()));
                        if (!validated) {
                            throw new Error("Not validated");
                        }
                        return validated;
                    } catch (e) {
                        return new AuthenticationError();
                    }
                })
            ),
            Effect.tap(({ verified }) =>
                verified instanceof AuthenticationError
                    ? Effect.logError(`Failed to verify access token due to error: ${verified}`)
                    : Effect.logInfo("Access token validated")
            ),
            Effect.map(({ verified }) => (verified instanceof AuthenticationError ? Either.left(verified) : Either.right(verified)))
        ),
    login: (login: { email: string; password: Password }) =>
        Effect.retryOrElse(
            Effect.Do.pipe(
                Effect.tap(() => Effect.logInfo(`Logging in`)),
                Effect.bind("userEff", () => performerServiceLive.pipe(Effect.flatMap(s => s.getByEmail(login.email)))),
                Effect.bind("user", ({ userEff }) => userEff),
                Effect.bind("valid", ({ user }) => comparePasswords({ plainText: login.password, hashValue: user.password ?? "" })),
                Effect.bind("secret", ({ valid }) => (valid ? O.some(secretKey()) : O.none())),
                Effect.bind("token", ({ secret, user }) =>
                    Effect.tryPromise({ try: () => pipe(user, createAccessToken(secret)), catch: e => console.error(e) })
                ),
                Effect.map(({ token }) => O.some(token)),
                Effect.tap(() => Effect.logInfo(`Successfully logged in user: ${login.email}`))
            ),
            Effect.runSync(retryPolicy),
            error =>
                Effect.Do.pipe(
                    Effect.tap(() => Effect.logInfo(`Failed to log in user: ${login.email} due to ${error}`)),
                    Effect.map(() => O.none())
                )
        ),
});
// DI
const authenticationService = Layer.effect(_AuthenticationService, Effect.succeed(_AuthenticationService.of(make())));

const mount = authenticationService;
export const authenticationServiceLive = pipe(_AuthenticationService, Effect.provide(mount));
