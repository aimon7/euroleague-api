import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const quarters = await client.boxscore.getQuarterScores({ gameCode: 1, season: 2023 });
const players = await client.boxscore.getPlayerStats({ gameCode: 1, season: 2023 });

console.log(quarters);
console.log(players.slice(0, 5));
