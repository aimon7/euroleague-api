import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const season = 2023;
const clubCode = "OLY";

const clubList = await client.clubs.list({ season });
const club = await client.clubs.get({ clubCode, season });
const roster = await client.clubs.getRoster({ clubCode, season });

console.log(clubList.slice(0, 5));
console.log(club);
console.log(roster.slice(0, 5));
