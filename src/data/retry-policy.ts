import { Config, Effect, Schedule } from "effect";
import { withDefault } from "effect/Config";

const DEFAULT_RETRY_CONFIG: [Config.Config<number>, Config.Config<string>] = [
    Config.number("RETRY_TIMES").pipe(Config.withDefault(2)),
    Config.string("RETRY_INTERVAL_MS").pipe(withDefault("1000")),
] as const;

const make = (retryAttempts: number, delay: string) =>
    Schedule.addDelay(Schedule.recurs(retryAttempts), () => `${parseInt(delay, 10)} millis`);

export const retryPolicy = Effect.all(DEFAULT_RETRY_CONFIG).pipe(Effect.andThen(([retryTimes, interval]) => make(retryTimes, interval)));
