import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const shots = await client.shots.getGame({ gameCode: 1, season: 2023 });

console.log(`Loaded ${shots.length} shots`);
console.log(shots.slice(0, 5));

// Skip per-row validation for very large feeds.
const raw = await client.shots.getGame({ gameCode: 1, season: 2023, validate: false });
console.log(`Loaded ${raw.length} shots without validation`);
