# Contributing to euroleague-api

Thanks for taking the time to contribute! This SDK wraps the (undocumented) Euroleague and
EuroCup public APIs, so most contributions are either **adding/fixing an API resource** or
**fixing a bug** when the upstream API drifts. This guide walks through both.

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Prerequisites

- **Node.js >= 20** (the SDK relies on the built-in `fetch`).
- npm (ships with Node).

```sh
npm install
```

## Before you push

Run the full local verification — it mirrors CI exactly, so if it is green, CI should be too:

```sh
npm run verify
```

This runs, in order: `typecheck` -> `lint` -> `format:check` -> `test` -> `build` -> `check:pkg`.

If `lint` or `format:check` complains, auto-fix most issues with:

```sh
npm run format
```

`format:check` covers Markdown, JSON, and YAML (Prettier); TypeScript formatting is enforced
through ESLint's `prettier/prettier` rule, so `npm run format` followed by `npm run lint` resolves
the vast majority of style problems.

## Recipe: add or fix an API resource

This is the primary contribution flow. Resources live under `src/resources/<name>/` and each one
is a small, self-contained folder (`*.dto.ts`, `*.schema.ts`, `*.service.ts`, `*.service.spec.ts`,
`__fixtures__/`, `index.ts`).

1. **Scaffold the folder.**

   ```sh
   npm run gen:resource <name>
   ```

   This creates `src/resources/<name>/` with starter `*.dto.ts`, `*.schema.ts`, `*.service.ts`,
   `*.service.spec.ts`, and `index.ts` files.

2. **Define the params and types (`<name>.dto.ts`).** Describe the typed param object(s) callers
   pass in (e.g. `season`, `gameCode`, `round`) and any string-literal unions the endpoint accepts.

3. **Write the Zod schema (`<name>.schema.ts`).** Model the upstream response with Zod and infer
   the output type from it. Schemas are validated at runtime and stay internal — only the inferred
   TypeScript types are exported. Output field names are normalized to **camelCase**.

4. **Implement the service (`<name>.service.ts`).** Extend `BaseResource`, build the endpoint path,
   call the shared HTTP client, and parse the response through your schema (see
   `src/resources/standings/standings.service.ts` for a minimal example, including how
   `ensureOneOf` guards user-supplied path segments).

5. **Capture a fixture.** Save a real (trimmed) API response as JSON under
   `src/resources/<name>/__fixtures__/`. Existing resources (e.g.
   `src/resources/standings/__fixtures__/standings.json`) show the expected shape.

6. **Write tests against the fixture (`<name>.service.spec.ts`).** Inject a fake `fetch` that
   returns your fixture, then assert on the built URL and the normalized output. Cover the happy
   path plus the relevant error classes (`EuroleagueApiError`, `EuroleagueSchemaError`,
   `EuroleagueValidationError`). Use `src/resources/standings/standings.service.spec.ts` as a
   template — it injects `fetch` via the client options and records the called URLs.

7. **Wire it into the client.** In `src/euroleague-client.ts`, import the service, add a `readonly`
   field, and instantiate it with `this.#http` in the constructor. Export the new public types from
   `src/index.ts` (only the inferred types and param interfaces — never the Zod schemas).

8. **Update the docs.** Add the resource to the **Resources** table in [README.md](./README.md) and,
   if it introduces a new method scheme, mention it in the relevant section.

9. **(Optional) Verify against live data.** The opt-in live smoke tests hit the real API to catch
   drift (see `src/__live__/live.spec.ts`). They are skipped by default and in CI:

   ```sh
   npm run test:live   # sets EUROLEAGUE_LIVE=1 under the hood
   ```

Finally, run `npm run verify` before opening your PR.

## Bug fixes and docs

For smaller changes you don't need the full resource recipe:

1. Open (or comment on) an issue describing the bug or docs gap.
2. Create a branch off `main`.
3. Add a failing test that reproduces the bug (for code changes), then fix it.
4. Run `npm run verify`.
5. Open a PR and link the issue.

Docs-only changes (README, this guide, JSDoc) just need `npm run format:check` to pass — but
running `npm run verify` is always safe.

## Pull request expectations

- **Keep PRs small and focused** — one resource or one fix per PR is ideal for review.
- **CI must be green.** The pipeline runs `lint`, `format`, `typecheck`, a `test` matrix
  (Node 20/22/24), and a `package` check in parallel; `npm run verify` reproduces all of it locally.
- **Add or update tests** for any behavior change, asserting against a fixture.
- **Update the README Resources table** when you add or change a resource.
- **Link the related issue** in the PR description.

Thanks again for contributing!
