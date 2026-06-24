import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const games = await client.schedule.getSeason({ season: 2023 });

console.log(`Loaded ${games.length} scheduled games`);
console.log(games.slice(0, 3));
