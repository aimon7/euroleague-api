import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const players = await client.players.getStats({
  mode: "PerGame",
  phase: "RS",
  season: 2023,
  type: "traditional"
});

console.log(players.slice(0, 5));
