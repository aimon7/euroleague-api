import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const competitions = await client.competitions.list();
const current = await client.competitions.get();

console.log(competitions);
console.log(current);
