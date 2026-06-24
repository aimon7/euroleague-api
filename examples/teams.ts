import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const teams = await client.teams.getStats({
  mode: "PerGame",
  season: 2023,
  type: "advanced"
});

console.log(teams.slice(0, 5));
