import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const events = await client.playByPlay.getGame({ gameCode: 1, season: 2023 });
console.log(`Loaded ${events.length} play-by-play events`);

const lineups = await client.playByPlay.getLineups({ gameCode: 1, season: 2023 });
console.log(lineups.slice(0, 3));
