# AGENTS.md

Guidance for AI agents and contributors working in this repo. Read this before making changes. The `README.md` covers usage; this file covers conventions and workflows that are **not** discoverable from the code.

## What this is

`euroleague-api` is a pure-TypeScript **npm SDK** wrapping the undocumented Euroleague/EuroCup public APIs. It ships to npm as a library.

- It is **not** a server, NestJS, or REST app. Never add NestJS, an HTTP server, controllers, or Swagger to the shipped package.
- The only runtime dependency is `zod`. Do not add runtime deps without a strong reason; everything else is `devDependencies`.
- `engines.node >= 20`; relies on native global `fetch` (no node-fetch/axios).

## Layout

- `src/resources/<domain>/` — one folder per domain (`players`, `teams`, `standings`, `schedule`, `games`, `shots`, `boxscore`, `play-by-play`, `game-metadata`). Each contains:
  - `*.service.ts` — request/parse logic (extends `BaseResource`).
  - `*.dto.ts` — typed input params + `as const` allow-lists.
  - `*.schema.ts` — Zod schema + inferred type (`import * as z`).
  - `*.service.spec.ts` — colocated Vitest tests.
  - `__fixtures__/` — captured API payloads used by specs.
  - `index.ts` — re-exports the service + its types.
- `src/core/` — `http-client.ts`, `config.ts`, `errors.ts`, `base-resource.ts`, `normalize.ts`, `schema.ts`, `validation.ts`.
- `src/euroleague-client.ts` — `EuroleagueClient` composes every resource; also exports a default `euroleague` instance.
- `src/index.ts` — the public barrel (the only thing consumers import).
- `src/__live__/` — opt-in live smoke tests (see `test:live`).
- `examples/` — one runnable script per resource; `scripts/` — the resource scaffolder. Both are linted but **not** shipped.

## Conventions

- **Schemas stay internal.** Only the **inferred types** are re-exported from `src/index.ts`. Never export a Zod schema from the public barrel.
- **Normalization.** Most responses become `NormalizedRowSchema` (`Record<string, string | number | boolean | null>`): keys are camelCased (incl. `SCREAMING_SNAKE`), values trimmed, and numeric strings coerced to `number` (so leading zeros are dropped — intentional).
- **Validation guard.** Any caller value interpolated into a URL path/feed key must go through `ensureOneOf(...)` (see `core/validation.ts`) to prevent path-traversal injection.
- **Large feeds** (`shots`, `playByPlay`) accept `{ validate: false }` to skip per-row Zod parsing and return raw normalized rows.
- **Errors** (all exported): `EuroleagueApiError`, `EuroleagueSchemaError`, `EuroleagueValidationError`, `EuroleagueParseError`, `EuroleagueNetworkError`, `EuroleagueTimeoutError`.

## Public API shape

- Instance client with namespaced resources: `client.players.getStats(...)`, `client.boxscore.getGame(...)`.
- `competition`: `"euroleague" | "eurocup"` (default `euroleague`), mapped internally to `E`/`U`. `season` is the **start year** as a `number` (>= 2000); the seasoncode (`E2023`) is built internally — never ask callers for it.
- Method naming is explicit per access pattern:
  - Game-feed resources: `getGame` / `getRound` / `getSeason` / `getSeasons({ from, to })`.
  - `games`: `getReport*` / `getStats*` / `getTeamsComparison*` (with ``/`Round`/`Season`/`Seasons` suffixes).
  - Stats/leaders (`players`, `teams`): `getStats` / `getStatsRange({ from, to })` / `getStatsAllSeasons`, and the `getLeaders*` equivalents.
  - `standings`: `getRound`.
  - Single-item getters return one object; the round/season/range variants return arrays.

## Commands

- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint flat config. **0 errors is the bar.** The ~18 `no-console` **warnings** in `examples/` and `scripts/` are intentional — do not "fix" them.
- `npm run format:check` / `npm run format` — Prettier (also enforced in CI and via the lint config).
- `npm test` — `vitest run --coverage`. HTTP is mocked by injecting `fetch` via client options; fixtures live in each resource's `__fixtures__/`.
- `npm run build` — tsup → `dist/` (ESM `.mjs` + CJS `.cjs` + `.d.ts`/`.d.cts`).
- `npm run check:pkg` — `publint && attw --pack .`.
- `npm run gen:resource <name>` — scaffold a new resource.
- `npm run example <file>` — run an `examples/*.ts` script via tsx.
- `npm run test:live` — opt-in (`EUROLEAGUE_LIVE=1`); hits the real API, skipped in CI.
- `npm run verify` (= `prepublishOnly`) — full gate: typecheck → lint → format:check → test → build → check:pkg.

## Adding a resource

1. `npm run gen:resource <name>` (scaffolds dto/schema/service/spec/index).
2. Use the `players` resource as the canonical template.
3. Wire the service into `EuroleagueClient` (`src/euroleague-client.ts`).
4. Re-export the new **inferred types** from `src/index.ts`.
5. Add `__fixtures__/` payloads and a colocated `*.service.spec.ts`.

## Packaging

- Dual ESM+CJS via tsup; `exports` map lists `types` first; `main`/`module`/`types` set; `files: ["dist"]`; `sideEffects: false`.
- Only `dist/` and `README.md` end up in the tarball.

## Release

- Bump with `npm version patch|minor` and push the `v*` tag.
- `.github/workflows/release.yml` publishes to npm via OIDC **trusted publishing** (no `NPM_TOKEN`) with provenance attestation.
- **Never run `npm publish` manually.** `prepublishOnly` runs the full gate before any publish.

## Git / repo specifics

- Remote uses the SSH alias `git@github.com-aimon7:aimon7/euroleague-api.git` (personal `aimon7` account).
- Commits **must** be authored `Ioannis Antoniou <ioannis@iantoniou.gr>` (set in local git config). The machine's global git identity is a work account and must not leak into this repo.
- `main` is **protected**: changes require a PR with 1 approving review (merge-commit only). Direct pushes to `main` are rejected — always work on a branch.
- Open PRs with the `aimon7` GitHub account; the machine's active `gh` account (an Enterprise Managed User) cannot open PRs here.
- `docs/` is git-ignored (local-only PRD) and never shipped.
