# Fullstack project with Next.js, RSC, Prisma, & Effect-ts

I made this app because I wanted an easy way to track recurring tasks or chores in a more organized way. These can be typical cleaning tasks like vacuuming or mopping, deep cleaning tasks like cleaning the windows or changing the oil in your car, or simpler tasks that just work on repeat like changing out mineral filters in your coffee machine.

I also wanted an excuse to explore [Effect-TS](https://effect.website/). I'm a big FP/Haskell fanboy and I saw that they had pipes and typeclasses, easier logging, easy to setup retry policies, etc. But they had me at typeclasses.

## Run the project

Your typical setup is to install node dependencies:

```bash
npm i
```

And then you need Docker installed and operational, because there's a Postgres DB container orchestrated with compose:

```bash
docker compose up -d
```

Typically Next projects use `next dev` but I changed it to `npm start` because it's fewer symbols and my custom Neovim plugin makes it easier to start projects that way:

```bash
npm start
```

## Making backups

When you delete the Postgres container, your data is obviously gone. I debated setting up volumes for persistence, but didn't want to assume who wanted to keep their data and who didn't. So for now, you can just leverage the following naïeve backup process. With the docker container running, you can run the following command to create a backup locally.

```bash
cat ./data.sql | docker compose -f docker-compose.yml exec -T database psql -U effect -d effect
```

## Effect-TS Features

-   [x] Dependency injection
-   [x] Custom errors
-   [x] Retry policy
-   [x] Env variables: retry policy in variables, feature flags
-   [x] Logging

## In the works

-   [ ] Schema validation with own error
-   [ ] writing to file
-   [ ] Observability

### Takeaways

## Pros of using Effect-TS

-   Splitting up of code between effectful and pure is a meaningful category (heh)
-   Lots of complexity thought out and abstracted
-   Huge suite of tools in a wide range of topics
-   Not overtly front-loaded
-   Majority can be done with the minority of imports
-   pipe-ing functions is a "once you start" kind of addictive programming
-   Encapsulation to the nth degree
-   Production code and test code designed in parallel
-   Community
-   FP is cool and I don't care what the haters say

## Cons

-   Actually front-loaded
-   Verbose
-   Overwhelming breadth of code already
-   Type errors really dense
-   Documentation always leaves a lot to be desired
-   No clear direction on how to actually write code
-   Trending away from pipelines towards generator functions
-   If you know, you know
-   Monads are burritos
