import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const season = 2023;

const rounds = await client.rounds.list({ season });
const firstRound = await client.rounds.get({ season, round: 1 });

console.log(rounds);
console.log(firstRound);
