# euroleague-api

A dependency-light TypeScript SDK for the Euroleague and EuroCup public APIs.

This package is inspired by and credits the original Python package, [`giasemidis/euroleague_api`](https://github.com/giasemidis/euroleague_api).

## Install

```sh
npm install euroleague-api
```

## Usage

```ts
import { EuroleagueClient } from "euroleague-api";

const client = new EuroleagueClient({ competition: "euroleague" });

const players = await client.players.getStats({
  season: 2023,
  type: "traditional",
  mode: "PerGame"
});
```

For quick scripts, use the preconfigured Euroleague singleton:

```ts
import { euroleague } from "euroleague-api";

const leaders = await euroleague.players.getLeaders({ season: 2023 });
```

## Development

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run check:pkg
```

Generate a resource skeleton with:

```sh
npm run gen:resource teams
```

## Package Shape

The published package contains only `dist/`, ships ESM and CommonJS entrypoints, and keeps Zod as the only runtime dependency.
