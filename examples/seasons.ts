import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const allSeasons = await client.seasons.list();

console.log(allSeasons.slice(0, 5));
