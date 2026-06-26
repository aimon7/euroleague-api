import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const profile = await client.people.getProfile({ personCode: "013380" });
const seasonStats = await client.people.getSeasonStats({
  personCode: "013380",
  phase: "RS",
  season: 2024
});
const records = await client.people.getRecords({ personCode: "013380" });

console.log({
  averagePoints: seasonStats.averagePerGame.points,
  profile,
  records
});
