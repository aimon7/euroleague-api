# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **`players.getStats` / `teams.getStats` season scoping.** The v3 statistics
  endpoint aggregates across **all** seasons (returning career/all-time rows and
  ~3075 player rows) unless `seasonMode=Single` is sent alongside `seasonCode`.
  The SDK never sent it, so a single-season call returned career totals — e.g.
  Cedi Osman as `IST;PAN` with 176 GP / 1537 PTS instead of his E2025 season
  (`PAN`, 39 GP / 502 PTS) — and the default `limit=400` silently dropped active
  players from the oversized list. `getStats` now sends `seasonMode=Single` by
  default for both players and teams (and `traditional` / `opponentsTraditional` /
  `advanced` / `opponentsAdvanced`), so a single-season call returns that season's
  totals. This also corrects `getStatsRange` / `getStatsAllSeasons` / `getLeaders*`,
  which build on per-season `getStats` calls.

### Added

- **Optional `seasonMode` on `players.getStats` / `teams.getStats`** (`PlayerSeasonMode`
  / `TeamSeasonMode`: `"Single" | "All"`, default `"Single"`). Pass
  `seasonMode: "All"` to retrieve the career/all-time aggregate the endpoint
  returns without season scoping.

## [1.0.0] - 2026-06-26

First stable release. Coverage expands from 12 to 15 resources after a
reverse-engineering pass over the EuroLeague/EuroCup endpoints, and the public
API surface is now considered stable. The SDK remains JSON + Zod only and wraps
**undocumented** upstream APIs, so endpoint availability can still change without
notice (see the `/leaders` change below).

### Added

- **`phases` resource** — `phases.list({ season })` and `phases.get({ season, phase })`
  wrap the v2 competition phases (`RS`/`PI`/`PO`/`FF`).
- **`rounds` resource** — `rounds.list({ season })` and `rounds.get({ season, round })`
  wrap the v2 round metadata.
- **`competitions` resource** — `competitions.list()` and `competitions.get()` wrap
  the v2 competitions catalog.
- **`seasons.get({ season })`** — single-season getter (complements `seasons.list()`).
- **`games.getGame({ season, gameCode })`** — v2 single-game info object.
- **`games.getPointsBreakdown` / `games.getComparison` / `games.getScoreEvolution`** —
  live per-game feeds (fastbreak/turnover/second-chance points, starters/bench
  comparison, and the per-minute score evolution series).
- **`boxscore.getGameStats` / `getRoundStats` / `getSeasonStats` / `getSeasonsStats`** —
  the rich v2 JSON boxscore (per-team coach, players, team and total stat lines).
- **`boxscore.getGameRoster({ season, gameCode, clubCode })`** — a team's dressed
  players for a game (starter flags, jersey, position, headshot).
- **`clubs.getLogo({ season, clubCode })`** — the team logo path from the `wapi` host.
- **Core:** a `wapi` host entry, an extended `LiveFeed` union (`ShootingGraphic`,
  `Comparison`, `Evolution`, `Players`), and an optional `extraQuery` argument on
  the internal live-feed fetch.

### Changed

- **BREAKING — `players.getLeaders*` / `teams.getLeaders*`.** The upstream
  `/statistics/{players|teams}/{type}/leaders` endpoint now returns `404`. These
  methods now derive leaders from the healthy v3 statistics list and rank
  client-side, descending, by a **required `statistic` argument**. `PlayerLeader`
  and `TeamLeader` now alias `PlayerStat` / `TeamStat`.

### Notes

- The `feeds.incrowdsports.com` CDN mirror of the v2/v3 API is not a separate
  resource; consumers can target it via the existing `hosts` client override.
- Legacy v1 (XML) endpoints are intentionally not wrapped — each has a v2/v3 JSON
  equivalent, keeping the SDK JSON + Zod only.
- `getLeadersRange` / `getLeadersAllSeasons` rank **per season** and concatenate
  the per-season boards; they do not produce a single global ranking across seasons.
