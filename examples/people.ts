import { HttpClient } from "../src/core/http-client";
import { PeopleService } from "../src/resources/people";

const people = new PeopleService(new HttpClient({ competition: "euroleague" }));

const profile = await people.getProfile({ personCode: "013380" });
const seasonStats = await people.getSeasonStats({
  personCode: "013380",
  phase: "RS",
  season: 2024
});
const records = await people.getRecords({ personCode: "013380" });

console.log({
  averagePoints: seasonStats.averagePerGame.points,
  profile,
  records
});
