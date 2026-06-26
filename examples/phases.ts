import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const season = 2023;

const phases = await client.phases.list({ season });
const regularSeason = await client.phases.get({ season, phase: "RS" });

console.log(phases);
console.log(regularSeason);
