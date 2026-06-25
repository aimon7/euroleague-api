# euroleague-api

[![npm version](https://img.shields.io/npm/v/euroleague-api.svg)](https://www.npmjs.com/package/euroleague-api)
[![npm downloads](https://img.shields.io/npm/dm/euroleague-api.svg)](https://www.npmjs.com/package/euroleague-api)
[![license](https://img.shields.io/npm/l/euroleague-api.svg)](https://www.npmjs.com/package/euroleague-api)
[![provenance](https://img.shields.io/badge/provenance-attested-blueviolet)](https://www.npmjs.com/package/euroleague-api#provenance)

A strongly-typed, dependency-light TypeScript SDK for the (undocumented) Euroleague and EuroCup public APIs.
Works in both **ESM** and **CommonJS** projects, ships its own types, runtime-validates every response with
[Zod](https://zod.dev), and keeps Zod as the only runtime dependency.

This package is inspired by and credits the original Python package,
[`giasemidis/euroleague_api`](https://github.com/giasemidis/euroleague_api).

## Install

```sh
npm install euroleague-api
```

Requires Node.js >= 20 (uses the built-in `fetch`).

## Quick start

```ts
import { EuroleagueClient } from "euroleague-api";

const client = new EuroleagueClient({ competition: "euroleague" });

const stats = await client.players.getStats({ season: 2023, type: "traditional", mode: "PerGame" });
const shots = await client.shots.getGame({ season: 2023, gameCode: 1 });
```

For quick scripts there is a preconfigured Euroleague singleton:

```ts
import { euroleague } from "euroleague-api";

const standings = await euroleague.standings.getRound({ season: 2023, round: 10 });
```

## Client options

```ts
const client = new EuroleagueClient({
  competition: "euroleague", // "euroleague" -> "E" | "eurocup" -> "U" (default: "euroleague")
  timeoutMs: 60_000, // optional request timeout (default 60s)
  retries: 0, // optional retries on 5xx/network errors (default 0)
  fetch: customFetch // optional injectable fetch (handy for tests/runtime overrides)
});
```

- **Competition** is a friendly union `"euroleague" | "eurocup"`, mapped to `E`/`U` internally.
- **Season** is the start year as a `number` (e.g. `2023`); the seasoncode (`E2023`/`U2023`) is built internally.

## Method scheme

Each domain is a namespaced resource. Aggregation uses an explicit, discoverable verb scheme with typed
param objects:

- `getGame({ season, gameCode })` — a single game
- `getRound({ season, round })` — every game in a round
- `getSeason({ season })` — every game in a season
- `getSeasons({ from, to })` — across a range of seasons

Stats resources (`players`, `teams`) additionally take typed enums and offer `getStats` / `getStatsRange` /
`getStatsAllSeasons` plus `getLeaders` variants.

All output field names are normalized to **camelCase**. Only the inferred TypeScript types are exported; the Zod
schemas stay internal.

## Resources

| Resource              | Key methods                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `client.players`      | `getStats`, `getStatsRange`, `getStatsAllSeasons`, `getLeaders`, `getLeadersRange`, `getLeadersAllSeasons` |
| `client.teams`        | `getStats`, `getStatsRange`, `getStatsAllSeasons`, `getLeaders`, `getLeadersRange`, `getLeadersAllSeasons` |
| `client.standings`    | `getRound`                                                                                                 |
| `client.schedule`     | `getSeason`, `getRound`, `getSeasons`                                                                      |
| `client.games`        | `getReport*`, `getStats*`, `getTeamsComparison*` (single + round/season/seasons)                           |
| `client.shots`        | `getGame`, `getRound`, `getSeason`, `getSeasons`                                                           |
| `client.boxscore`     | `getGame*`, `getQuarterScores*`, `getPlayerStats*`                                                         |
| `client.playByPlay`   | `getGame*`, `getLineups*`                                                                                  |
| `client.gameMetadata` | `getGame`, `getRound`, `getSeason`, `getSeasons`                                                           |

### Players & teams

```ts
const players = await client.players.getStats({
  type: "advanced", // "traditional" | "advanced" | "misc" | "scoring"
  mode: "PerGame", // "PerGame" | "Accumulated"
  phase: "RS", // optional: "RS" | "PO" | "FF"
  season: 2023
});

const leaders = await client.teams.getLeaders({ season: 2023, type: "traditional" });
const range = await client.players.getStatsRange({ from: 2021, to: 2023, type: "scoring" });
```

### Standings

```ts
// type: "basicstandings" | "calendarstandings" | "streaks" | "aheadbehind" | "margins"
const table = await client.standings.getRound({ season: 2023, round: 15, type: "basicstandings" });
```

### Schedule

```ts
const games = await client.schedule.getSeason({ season: 2023 });
const round = await client.schedule.getRound({ season: 2023, round: 1 });
```

### Games, shots, boxscore, play-by-play & metadata

```ts
const report = await client.games.getReport({ season: 2023, gameCode: 1 });
const shots = await client.shots.getGame({ season: 2023, gameCode: 1 });

const quarters = await client.boxscore.getQuarterScores({ season: 2023, gameCode: 1 });
const playerStats = await client.boxscore.getPlayerStats({ season: 2023, gameCode: 1 });

const events = await client.playByPlay.getGame({ season: 2023, gameCode: 1 });
const lineups = await client.playByPlay.getLineups({ season: 2023, gameCode: 1 });

const metadata = await client.gameMetadata.getGame({ season: 2023, gameCode: 1 });
```

Round/season/range variants of the game-based feeds resolve the relevant game codes from the schedule and
aggregate automatically (e.g. `client.shots.getRound({ season: 2023, round: 1 })`).

## Validation & the `{ validate: false }` escape hatch

Every response is validated against an internal Zod schema by default. For the very large live feeds
(`shots`, `playByPlay`) you can skip per-row validation for a performance win — the output is still normalized
to camelCase:

```ts
const shots = await client.shots.getGame({ season: 2023, gameCode: 1, validate: false });
```

## Errors

```ts
import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueSchemaError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "euroleague-api";
```

- `EuroleagueApiError` — a non-2xx HTTP response (`status`, `url`, `body`).
- `EuroleagueParseError` — a 2xx response whose body is not valid JSON (`url`, `status`, `bodySnippet`, original error as `cause`). Deterministic, so it is never retried.
- `EuroleagueNetworkError` — a transport-level failure such as a refused connection or DNS error (`url`, original error as `cause`). Retried per the `retries` option.
- `EuroleagueTimeoutError` — the request was aborted after `timeoutMs` (`url`, original error as `cause`). Subclass of `EuroleagueNetworkError`; retried per the `retries` option.
- `EuroleagueSchemaError` — the response failed validation (`endpoint`, Zod `issues`).
- `EuroleagueValidationError` — invalid input params (e.g. a bad season/competition).

## Development

```sh
npm install
npm run typecheck
npm run lint
npm test          # vitest run --coverage
npm run build     # tsup -> dist (ESM + CJS + d.ts)
npm run check:pkg # publint && attw --pack .
```

Run an example with `tsx`:

```sh
npm run example -- examples/shots.ts
```

Generate a new resource skeleton:

```sh
npm run gen:resource <name>
```

### Live smoke tests

A small set of opt-in tests hit the real API to detect upstream drift. They are skipped by default (and in CI);
enable them explicitly:

```sh
npm run test:live
```

## Package shape

The published package contains only `dist/` (plus the README), ships ESM and CommonJS entrypoints with
`types` listed first in every `exports` condition, and keeps Zod as the only runtime dependency.

## License

MIT
