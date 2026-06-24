import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const standings = await client.standings.getRound({
  round: 10,
  season: 2023,
  type: "basicstandings"
});

console.log(standings);
