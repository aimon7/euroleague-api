import { HttpClient } from "../src/core/http-client";
import { SeasonsService } from "../src/resources/seasons";

const seasons = new SeasonsService(new HttpClient({ competition: "euroleague" }));

const allSeasons = await seasons.list();

console.log(allSeasons.slice(0, 5));
