import { HttpClient } from "../src/core/http-client";
import { ClubsService } from "../src/resources/clubs";

const clubs = new ClubsService(new HttpClient({ competition: "euroleague" }));

const season = 2023;
const clubCode = "OLY";

const clubList = await clubs.list({ season });
const club = await clubs.get({ clubCode, season });
const roster = await clubs.getRoster({ clubCode, season });

console.log(clubList.slice(0, 5));
console.log(club);
console.log(roster.slice(0, 5));
