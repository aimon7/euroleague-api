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

## Live demo

**[euroleague-api-demo](https://aimon7.github.io/euroleague-api-demo/)** is a fully-typed, client-side showcase of this SDK — no backend or proxy; it calls the EuroLeague API directly from the browser. Source: [github.com/aimon7/euroleague-api-demo](https://github.com/aimon7/euroleague-api-demo).

- **Landing** — pick EuroLeague or EuroCup and a season (kept in the URL); browse the **clubs** grid and sort the **standings** table.
- **Team pages** (`/team/$clubCode`) — club info, full **roster** (players + staff), and team **stats** including advanced metrics from the API plus ones computed in the app (labeled `From API` vs `Calculated`).
- **Player pages** (`/player/$personCode`) — profile, season stat cards, a per-game **trend chart**, and computed advanced stats with their formulas.

The TanStack Query sections below show the core data-fetching patterns the demo uses.

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
| `client.seasons`      | `list`                                                                                                     |
| `client.clubs`        | `list`, `get`, `getRoster`                                                                                 |
| `client.people`       | `getProfile`, `getCareer`, `getSeasonRegistration`, `getCareerStats`, `getSeasonStats`, `getRecords`       |
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

`getStats` returns totals scoped to the requested `season`. The v3 statistics
endpoint otherwise aggregates **across all seasons** (career/all-time rows), so
the SDK sends `seasonMode=Single` by default. To opt into the all-time aggregate
pass `seasonMode: "All"` (for multi-season queries use `getStatsRange`):

```ts
// Career/all-time totals for the whole stats list:
const allTime = await client.players.getStats({ season: 2025, seasonMode: "All", mode: "Accumulated" });
```

`minutesPlayed` stays in decimal minutes, matching the v3 rows.

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

### Seasons, clubs & people

```ts
const seasons = await client.seasons.list();

const clubs = await client.clubs.list({ season: 2023 });
const olympiacos = await client.clubs.get({ season: 2023, clubCode: "OLY" });
const roster = await client.clubs.getRoster({ season: 2023, clubCode: "OLY" });

const profile = await client.people.getProfile({ personCode: "013380" });
const seasonStats = await client.people.getSeasonStats({ season: 2024, personCode: "013380", phase: "RS" });
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

## Using with React (TanStack Query)

The SDK calls the API with the standard `fetch`, and both Euroleague hosts send `Access-Control-Allow-Origin: *`,
so it runs **directly in the browser** — no proxy or backend required. The API is read-only, so everything is a
`useQuery`; there are no mutations.

Install the peer dependency alongside the SDK:

```sh
npm install euroleague-api @tanstack/react-query
```

### 1. Provide the QueryClient

```tsx
// src/main.tsx (Vite / CRA entry)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

### 2. Share one client instance

`EuroleagueClient` is stateless, so create it once and import it everywhere.

```ts
// src/lib/euroleague.ts
import { EuroleagueClient, type Competition } from "euroleague-api";

export const COMPETITION: Competition = "euroleague";

export const euroleagueClient = new EuroleagueClient({
  competition: COMPETITION,
  retries: 2
});
```

### 3. A query-key factory

Keep keys in one place and always include the competition, so Euroleague and EuroCup never collide in the cache.

```ts
// src/lib/euroleague-keys.ts
import type { PlayerStatsParams, ShotGameParams, StandingsRoundParams } from "euroleague-api";

import { COMPETITION } from "./euroleague";

export const euroleagueKeys = {
  root: ["euroleague", COMPETITION] as const,
  playerStats: (params: PlayerStatsParams) => [...euroleagueKeys.root, "players", "stats", params] as const,
  standingsRound: (params: StandingsRoundParams) => [...euroleagueKeys.root, "standings", "round", params] as const,
  gameShots: (params: ShotGameParams) => [...euroleagueKeys.root, "shots", "game", params] as const
};
```

### 4. A reusable, typed hook

Responses are normalized records (`Record<string, string | number | boolean | null>`) whose keys are the
camelCased upstream fields. Use TanStack Query's `select` to map them into a shape your component owns:

```ts
// src/hooks/usePlayerStats.ts
import { useQuery } from "@tanstack/react-query";
import type { PlayerStat, PlayerStatsParams } from "euroleague-api";

import { euroleagueClient } from "../lib/euroleague";
import { euroleagueKeys } from "../lib/euroleague-keys";

export interface PlayerRow {
  player: string;
  team: string;
  gamesPlayed: number;
  points: number;
  assists: number;
}

function toPlayerRow(row: PlayerStat): PlayerRow {
  return {
    player: String(row.player ?? ""),
    team: String(row.team ?? ""),
    gamesPlayed: Number(row.gamesPlayed ?? 0),
    points: Number(row.points ?? 0),
    assists: Number(row.assists ?? 0)
  };
}

export function usePlayerStats(params: PlayerStatsParams) {
  return useQuery({
    queryKey: euroleagueKeys.playerStats(params),
    queryFn: () => euroleagueClient.players.getStats(params),
    select: (rows) => rows.map(toPlayerRow),
    staleTime: 1000 * 60 * 60 // season stats change a few times a week at most
  });
}
```

### 5. Consume it in a component

```tsx
// src/components/PlayerStatsTable.tsx
import { EuroleagueApiError, EuroleagueSchemaError } from "euroleague-api";

import { usePlayerStats } from "../hooks/usePlayerStats";

export function PlayerStatsTable() {
  const { data, isPending, isError, error } = usePlayerStats({
    season: 2023,
    type: "traditional",
    mode: "PerGame"
  });

  if (isPending) {
    return <p>Loading player stats…</p>;
  }

  if (isError) {
    const message =
      error instanceof EuroleagueApiError
        ? `Euroleague API responded ${error.status}`
        : error instanceof EuroleagueSchemaError
          ? "The API returned an unexpected shape"
          : "Something went wrong";
    return <p role="alert">{message}</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Team</th>
          <th>GP</th>
          <th>PPG</th>
          <th>APG</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={`${p.player}-${p.team}`}>
            <td>{p.player}</td>
            <td>{p.team}</td>
            <td>{p.gamesPlayed}</td>
            <td>{p.points}</td>
            <td>{p.assists}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`data` is fully typed as `PlayerRow[]` thanks to `select`, and errors narrow to the SDK's typed error classes.

### Next.js (App Router) — server prefetch + hydration

In the App Router you can run the SDK on the server and hand a warm cache to the client; the same
`usePlayerStats` hook works unchanged.

```tsx
// app/providers.tsx
"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

```tsx
// app/players/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { euroleagueClient } from "@/lib/euroleague";
import { euroleagueKeys } from "@/lib/euroleague-keys";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";

const params = { season: 2023, type: "traditional", mode: "PerGame" } as const;

export default async function PlayersPage() {
  const queryClient = new QueryClient();

  // Runs server-side; the dehydrated cache is streamed to the client.
  await queryClient.prefetchQuery({
    queryKey: euroleagueKeys.playerStats(params),
    queryFn: () => euroleagueClient.players.getStats(params)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlayerStatsTable />
    </HydrationBoundary>
  );
}
```

Wrap your `app/layout.tsx` body in `<Providers>`. The prefetched query key must match the hook's key exactly
(same params) so the client mounts with data already in cache — no loading flash. The game-feed aggregations
(`getSeason`, `getSeasons`) fan out into many requests, so prefer prefetching those on the server with a longer
`staleTime`.

## Using with Vue (TanStack Query)

The same browser/CORS and read-only notes apply. The `lib/euroleague.ts` client, the `lib/euroleague-keys.ts`
factory, and the `PlayerRow` interface + `toPlayerRow` mapper from the React section above are plain TypeScript —
extract the mapper into `lib/player-row.ts` and reuse all three across frameworks.

```sh
npm install euroleague-api @tanstack/vue-query
```

### 1. Install the plugin

```ts
// src/main.ts
import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";

createApp(App).use(VueQueryPlugin).mount("#app");
```

### 2. A typed composable

```ts
// src/composables/usePlayerStats.ts
import { useQuery } from "@tanstack/vue-query";
import type { PlayerStatsParams } from "euroleague-api";

import { euroleagueClient } from "../lib/euroleague";
import { euroleagueKeys } from "../lib/euroleague-keys";
import { toPlayerRow } from "../lib/player-row";

export function usePlayerStats(params: PlayerStatsParams) {
  return useQuery({
    queryKey: euroleagueKeys.playerStats(params),
    queryFn: () => euroleagueClient.players.getStats(params),
    select: (rows) => rows.map(toPlayerRow),
    staleTime: 1000 * 60 * 60
  });
}
```

### 3. Use it in a component

```vue
<!-- src/components/PlayerStatsTable.vue -->
<script setup lang="ts">
import { EuroleagueApiError, EuroleagueSchemaError } from "euroleague-api";

import { usePlayerStats } from "../composables/usePlayerStats";

const { data, isPending, isError, error } = usePlayerStats({
  season: 2023,
  type: "traditional",
  mode: "PerGame"
});

function errorMessage(err: unknown): string {
  if (err instanceof EuroleagueApiError) return `Euroleague API responded ${err.status}`;
  if (err instanceof EuroleagueSchemaError) return "The API returned an unexpected shape";
  return "Something went wrong";
}
</script>

<template>
  <p v-if="isPending">Loading player stats…</p>
  <p v-else-if="isError" role="alert">{{ errorMessage(error) }}</p>
  <table v-else-if="data">
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>GP</th>
        <th>PPG</th>
        <th>APG</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in data" :key="`${p.player}-${p.team}`">
        <td>{{ p.player }}</td>
        <td>{{ p.team }}</td>
        <td>{{ p.gamesPlayed }}</td>
        <td>{{ p.points }}</td>
        <td>{{ p.assists }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

`data`, `isPending`, and `error` are reactive refs (auto-unwrapped in the template). Pass refs/computed as the
`params` if you need the query to react to user input.

## Using with Angular (TanStack Query)

Uses the Angular adapter, which exposes results as **signals**. It is officially experimental, so pin the
version. The same `lib/euroleague.ts`, `lib/euroleague-keys.ts`, and `lib/player-row.ts` files are reused.

```sh
npm install euroleague-api @tanstack/angular-query-experimental
```

### 1. Provide the QueryClient

```ts
// src/app/app.config.ts
import { type ApplicationConfig } from "@angular/core";
import { provideTanStackQuery, QueryClient } from "@tanstack/angular-query-experimental";

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(new QueryClient())]
};
```

### 2. A component with `injectQuery`

`injectQuery` returns signals, so the template calls `query.data()`, `query.isPending()`, etc.

```ts
// src/app/player-stats-table.component.ts
import { Component } from "@angular/core";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { EuroleagueApiError, EuroleagueSchemaError } from "euroleague-api";

import { euroleagueClient } from "../lib/euroleague";
import { euroleagueKeys } from "../lib/euroleague-keys";
import { toPlayerRow } from "../lib/player-row";

const PARAMS = { season: 2023, type: "traditional", mode: "PerGame" } as const;

@Component({
  selector: "app-player-stats-table",
  standalone: true,
  template: `
    @if (query.isPending()) {
      <p>Loading player stats…</p>
    } @else if (query.isError()) {
      <p role="alert">{{ errorMessage(query.error()) }}</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>GP</th>
            <th>PPG</th>
            <th>APG</th>
          </tr>
        </thead>
        <tbody>
          @for (p of query.data(); track p.player + p.team) {
            <tr>
              <td>{{ p.player }}</td>
              <td>{{ p.team }}</td>
              <td>{{ p.gamesPlayed }}</td>
              <td>{{ p.points }}</td>
              <td>{{ p.assists }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `
})
export class PlayerStatsTableComponent {
  query = injectQuery(() => ({
    queryKey: euroleagueKeys.playerStats(PARAMS),
    queryFn: () => euroleagueClient.players.getStats(PARAMS),
    select: (rows) => rows.map(toPlayerRow)
  }));

  errorMessage(err: unknown): string {
    if (err instanceof EuroleagueApiError) return `Euroleague API responded ${err.status}`;
    if (err instanceof EuroleagueSchemaError) return "The API returned an unexpected shape";
    return "Something went wrong";
  }
}
```

For params driven by user input, expose them as signals and read them inside the `injectQuery` callback so the
query refetches automatically when they change.

## Contributing

Contributions are welcome — especially adding new resources or fixing schema drift when the upstream
API changes. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow (including the
step-by-step recipe for adding a resource) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). The short
version: run `npm run verify` before opening a PR — it mirrors CI exactly.

## Development

```sh
npm install
npm run typecheck
npm run lint
npm run format:check
npm test          # vitest run --coverage
npm run build     # tsup -> dist (ESM + CJS + d.ts)
npm run check:pkg # publint && attw --pack .
npm run verify    # all of the above, in one command (mirrors CI)
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
