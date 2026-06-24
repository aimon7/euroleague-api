# PRD: `euroleague-api` — a TypeScript SDK for the Euroleague / EuroCup API

Status: Draft for review
Owner: ianton
Package: `euroleague-api` (npm name confirmed available)
Inspired by: [`giasemidis/euroleague_api`](https://github.com/giasemidis/euroleague_api) (Python)

---

## 1. Objective

Build a strongly-typed, importable Node/TypeScript SDK that wraps the (undocumented, third-party)
Euroleague and EuroCup HTTP APIs, so a developer can do:

```ts
import { EuroleagueClient } from "euroleague-api";

const client = new EuroleagueClient({ competition: "euroleague" });
const shots = await client.shots.getGame({ season: 2023, gameCode: 1 });
//    ^ fully typed, discoverable via cmd+space
```

**Who it's for:** TS/JS developers building basketball analytics, dashboards, bots, or notebooks
who want typed access to Euroleague data without hand-rolling `fetch` calls and response shapes.

**Why now:** No maintained, strongly-typed Node equivalent exists; the Python package proves demand
(86 stars) but leaves the JS ecosystem unserved.

### Success criteria (specific, testable)

- `npm install euroleague-api` then `import { EuroleagueClient }` works in **ESM and CJS** TS projects.
- Every public method has typed params and a typed return; `cmd+space` surfaces both in the editor.
- Responses are **runtime-validated**; an upstream shape change throws a clear `EuroleagueSchemaError`
  at the SDK boundary, not `undefined` deep in consumer code.
- `publint` and `@arethetypeswrong/cli` report **zero** errors against the packed tarball.
- Unit tests cover every resource's URL building, param mapping, parsing, and error paths (mocked HTTP).
- Published package contains **only** `dist/` + types (no source, no dev deps leaking in).
- The package's only runtime dependency is **Zod** (or none if we inline validation later).

---

## 2. Non-goals (out of scope)

- **No HTTP server, no NestJS runtime, no Swagger UI** in the shipped product. (Decided: SDK-only.)
- No DataFrame/pandas equivalent — we return plain typed arrays/objects, not a tabular abstraction.
- No caching layer, no CLI binary, no React hooks (possible future packages, not v1).
- No write/auth endpoints — the Euroleague feeds are read-only public data.
- No scraping of non-API sources beyond the endpoints the Python lib already uses.

---

## 3. Key technical decisions (with rationale)

- **Language/output:** TypeScript, ESM-first, dual **ESM + CJS** build so both `import` and `require`
  consumers work. Built with [`tsup`](https://tsup.egoist.dev) (esbuild) → `.mjs`, `.cjs`, `.d.ts`.
- **HTTP:** native `fetch` (Node 18+; we target **Node >= 20** LTS). Zero HTTP dependency.
- **Validation:** **Zod v4**, imported as `import * as z from "zod"`, `package.json` `"sideEffects": false`.
  We export only the **inferred types** (`z.infer`), never the schemas — consumers never import Zod.
  (Backend SDK → bundle size is negligible per Zod's own data; ergonomics win. `zod/mini` is a near
  drop-in if browser footprint ever matters.)
- **Validation = source of truth:** each response type is `z.infer<typeof Schema>`, so the validation
  and the TS type can never drift.
- **Public shape:** instance client + namespaced resources (`client.players.getStats(...)`), plus a
  ready-made default export for quick use. Mirrors the `openai-node` / `octokit` ergonomics.
- **Architecture:** NestJS-style *discipline* without the runtime — one folder per domain with a
  service (logic), DTOs (typed inputs), schema (Zod + inferred models), and a colocated `*.spec.ts`.
- **Dev loop:** runnable `examples/*.ts` (via `tsx`) + Vitest watch. No server.
- **Quality gates:** `publint` + `attw` + `tsc --noEmit` + Vitest in `prepublishOnly` and CI.

---

## 4. Public API design

### 4.1 Client construction

```ts
const client = new EuroleagueClient({
  competition: "euroleague", // "euroleague" -> "E" | "eurocup" -> "U" (mapped internally)
  timeoutMs: 60_000,          // optional, default 60s (matches Python)
  retries: 2,                 // optional, default 0 (enhancement over Python)
  fetch: customFetch,         // optional injectable fetch for testing/runtime override
});

// Quick-use default (Euroleague competition preconfigured):
import { euroleague } from "euroleague-api";
await euroleague.standings.getSeason({ season: 2023 });
```

- **Competition** accepted as a friendly union `"euroleague" | "eurocup"`, mapped to `E`/`U` internally.
- **Season** accepted as a `number` year (e.g., `2023`); seasoncode `E2023`/`U2023` built internally.

### 4.2 Resource + method scheme (consistent across domains)

Each domain is a namespaced resource. Aggregation variants follow the Python pattern but with a
consistent, discoverable verb scheme and typed param objects:

- `getGame({ season, gameCode })` — single game
- `getRound({ season, round })` — all games in a round
- `getSeason({ season })` — all games in a season
- `getSeasons({ from, to })` — across a season range

Stats resources (players/teams) additionally take typed enums:

```ts
await client.players.getStats({
  type: "traditional",   // "traditional" | "advanced" | "misc" | "scoring"
  mode: "PerGame",       // "PerGame" | "Accumulated"
  phase: "RS",           // optional: "RS" | "PO" | "FF"
  season: 2023,
});
```

> Design note (DECIDED): explicit per-scope verbs (`getGame`/`getRound`/`getSeason`/`getSeasons`)
> over a single overloaded `get({...})`, for cleaner return types and better `cmd+space` discoverability.

### 4.3 Return types

- Plain typed arrays/objects, e.g. `Promise<ShotEvent[]>`, `Promise<PlayerStatRow[]>`, `Promise<Standing[]>`.
- All field names normalized to camelCase; raw API casing handled in the schema layer.

### 4.4 Errors

- `EuroleagueApiError` — non-2xx HTTP (status, url, body).
- `EuroleagueSchemaError` — response failed Zod validation (Zod issue list + endpoint).
- `EuroleagueValidationError` — invalid input params (e.g., bad competition/season).

---

## 5. Project structure

```
euroleague-api/
  src/
    core/
      http-client.ts          # fetch wrapper: base URL, query building, timeout, retries, errors
      config.ts               # hosts (v1/v2/v3 + live feeds), competition + seasoncode helpers
      errors.ts               # EuroleagueApiError / SchemaError / ValidationError
      base-resource.ts        # shared base: holds http client + config; season/round aggregation helpers
      pagination.ts           # (if needed) limit handling
    resources/
      players/
        players.service.ts
        players.dto.ts        # input param types
        players.schema.ts     # zod schemas + z.infer models
        players.service.spec.ts
        index.ts
      teams/  games/  standings/  schedule/  boxscore/  play-by-play/  shots/  game-metadata/
        (same 5-file layout each)
    euroleague-client.ts      # composes all resources; exposes `new EuroleagueClient(opts)`
    index.ts                  # public entry: export client, default singleton, all inferred types, errors
  examples/                   # runnable usage scripts (tsx) doubling as docs
  scripts/
    gen-resource.ts           # plop/hygen scaffolder: `npm run gen:resource <name>`
  docs/
    PRD.md
  tsup.config.ts
  vitest.config.ts
  tsconfig.json
  package.json
  README.md
  .github/workflows/release.yml  # optional: npm publish --provenance
```

---

## 6. Commands

- Install: `npm install`
- Dev (watch tests): `npm run test:watch`  (`vitest`)
- Run an example: `npm run example -- examples/shots.ts`  (`tsx`)
- Type-check: `npm run typecheck`  (`tsc --noEmit`)
- Lint/format: `npm run lint`  (ESLint flat config) / `npm run format` (Prettier)
- Test once + coverage: `npm test`  (`vitest run --coverage`)
- Build: `npm run build`  (`tsup`)
- Validate package: `npm run check:pkg`  (`publint && attw --pack .`)
- Generate a resource: `npm run gen:resource <name>`
- Pre-publish gate: `prepublishOnly` = `build && check:pkg && test`
- Publish: `npm publish --access public --provenance` (run by owner; needs npm auth)

---

## 7. Code style

- **ESLint + Prettier ported from `~/WebstormProjects/unity-onboarding-frontend`** (ESLint v9 flat config),
  with all React/Tailwind/Playwright/alias bits removed and tuned for a Node SDK:
  - Keep: `tseslint.config([...])`, `js.configs.recommended` + `tseslint.configs.recommended`,
    `eslint-plugin-simple-import-sort` (imports+exports), `curly: ["error","all"]`,
    `@typescript-eslint/no-unused-vars` (`^_` ignores), `no-console: "warn"`, Prettier via
    `eslint-plugin-prettier` + `eslint-config-prettier`.
  - Remove: `eslint-plugin-react`/`react-hooks`/`react-refresh`, `eslint-plugin-better-tailwindcss`,
    `globals.browser`→`globals.node`, React-first/alias/css import-sort groups, `tsx`/e2e/playwright.
  - Prettier options (single source of truth in `prettier.config.mjs`): `trailingComma: "none"`,
    `tabWidth: 2`, `semi: true`, `bracketSpacing: true`, `bracketSameLine: false`,
    `arrowParens: "always"`, `printWidth: 120`, `endOfLine: "lf"`.
- Strict `tsconfig` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Named exports only from `index.ts`; no default export except the convenience `euroleague` singleton.
- One class per resource service; methods are `async`, accept a single typed param object, return inferred types.
- Schemas own the truth: `export type Player = z.infer<typeof PlayerSchema>`.
- No comments that narrate code; comments only for non-obvious upstream-API quirks.

Representative skeleton:

```ts
// resources/shots/shots.schema.ts
import * as z from "zod";
export const ShotEventSchema = z.object({
  player: z.string(),
  team: z.string(),
  coordX: z.number(),
  coordY: z.number(),
  points: z.number(),
  // ...normalized fields
});
export type ShotEvent = z.infer<typeof ShotEventSchema>;

// resources/shots/shots.service.ts
import { BaseResource } from "../../core/base-resource";
import { ShotEventSchema, type ShotEvent } from "./shots.schema";
import type { GameRef } from "./shots.dto";

export class ShotsService extends BaseResource {
  async getGame({ season, gameCode }: GameRef): Promise<ShotEvent[]> {
    const data = await this.http.getLiveFeed("Points", { season, gamecode: gameCode });
    return this.parseArray(ShotEventSchema, data.Rows ?? data);
  }
}
```

---

## 8. Testing strategy

- **Framework:** Vitest. Tests colocated as `*.service.spec.ts` next to each service.
- **HTTP is mocked** (inject a fake `fetch` via client options, or `vi.fn`); no live network in unit tests.
  Captured JSON fixtures live in `resources/<domain>/__fixtures__/`.
- Per resource, assert: correct URL + query params built, competition/season mapping, response parsed
  to the right shape, schema-failure path throws `EuroleagueSchemaError`, non-2xx throws `EuroleagueApiError`.
- A small set of **opt-in live smoke tests** (`test:live`, skipped in CI by default) hit the real API to
  detect upstream drift.
- Coverage target: 90%+ lines on `core/` and each `service`.

---

## 9. Validation strategy (Zod)

- Validate by default. Each method runs the response through its schema before returning.
- Expose `{ validate: false }` per-call escape hatch for huge payloads (play-by-play, shots) where
  parsing thousands of rows has measurable cost.
- Normalize raw API field names → camelCase inside schemas via `.transform()` / key mapping.
- Export inferred types only; schemas stay internal.

---

## 10. Build & publish

- `package.json` essentials:
  - `"type": "module"`, `"sideEffects": false`, `"files": ["dist"]`, `"engines": { "node": ">=20" }`
  - `exports` map with **`types` first** in every condition:
    ```jsonc
    "exports": { ".": {
      "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    } }
    ```
- `tsup.config.ts`: `format: ["esm","cjs"]`, `dts: true`, `clean: true`, explicit `.mjs`/`.cjs` extensions.
- Quality gates wired into `prepublishOnly` + CI: `publint`, `@arethetypeswrong/cli`, `tsc --noEmit`, Vitest.
- Optional GitHub Actions `release.yml` doing `npm publish --provenance` on tag (owner provides `NPM_TOKEN`).

---

## 11. Boundaries

- **Always:** run `typecheck` + tests before commits; keep schema as the single source of truth;
  add a fixture + spec for every new method; keep `dist/` out of git, keep `src/` out of the tarball.
- **Ask first:** adding any runtime dependency beyond Zod; changing the public method-naming scheme;
  changing the `exports`/Node target; the actual `npm publish`.
- **Never:** commit secrets or an `NPM_TOKEN`; ship NestJS/server deps in the package; hit live network
  in unit tests; remove failing tests to make CI green.

---

## 12. Domain & endpoint appendix (full-parity scope)

**Hosts**
- `https://api-live.euroleague.net/v3/competitions/{E|U}` — stats, standings, games, schedule (primary).
- `.../v2/competitions/{E|U}` — leaders endpoints.
- `.../v1/results/` — some results.
- `https://live.euroleague.net/api/{Boxscore|PlaybyPlay|Points|Header}?gamecode={n}&seasoncode={E2023}` — feeds.

**Resources & methods (ported from Python, namespaced)**

- `players` — `getStats({type,mode,phase?,season})` + `*AllSeasons` / `*Range`; `getLeaders(...)` +
  all/single/range. (`/v3/.../statistics/players/{traditional|advanced|misc|scoring}`)
- `teams` — same scheme. (`/statistics/teams/{traditional|advanced|opponentsTraditional|opponentsAdvanced}`)
- `games` — `getReport*`, `getStats*`, `getTeamsComparison*` (endpoints `report|stats|teamsComparison`).
- `standings` — `getRound({season,round,type?})` where type ∈
  `basicstandings|calendarstandings|streaks|aheadbehind|margins`.
- `schedule` — `getSeason({season})`.
- `boxscore` — `getGame` + team quarter scores + player stats, with round/season/range variants. (feed `Boxscore`)
- `playByPlay` — `getGame*` + `getLineups*`. (feed `PlaybyPlay`)
- `shots` — `getGame*`. (feed `Points`)
- `gameMetadata` — `getGame*`. (feed `Header`)
- `core` helpers — game codes per season/round; aggregation over collections of games.

Common params: `statisticMode` (PerGame|Accumulated), `phaseTypeCode` (RS|PO|FF, optional), `limit` (default 400).

---

## 13. Implementation roadmap (feeds `planning-and-task-breakdown`)

1. **Foundation:** repo scaffold, tsconfig/tsup/vitest/eslint, `core/` (http-client, config, errors,
   base-resource), `package.json` exports + gates, CI. **No domains yet.**
2. **Tracer bullet — `players`:** full vertical slice (dto/schema/service/spec + fixtures + example +
   client wiring) proving the whole pipeline end-to-end, including a dry-run `npm pack` + `publint`/`attw`.
3. **Expand by domain** (each its own task-breakdown): `teams` → `standings` → `schedule` → `games`
   → `shots` → `boxscore` → `playByPlay` → `gameMetadata`.
4. **Polish & 1.0.0:** README with examples, typedoc (optional), live smoke tests, publish dry-run, release.

---

## 14. Resolved decisions (was: open questions)

- Method-naming scheme: **explicit per-scope verbs** (`getGame`/`getRound`/`getSeason`/`getSeasons`). DECIDED.
- Field normalization: **normalize everything to camelCase**. DECIDED.
- Retry/backoff defaults: **`retries: 0`** by default (Python parity); retry is opt-in via client options. DECIDED.
- Publishing: **include an optional GitHub Actions `release.yml`** (`npm publish --provenance` on tag);
  owner provides `NPM_TOKEN`. Manual local publish also supported. DECIDED.
