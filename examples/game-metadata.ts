import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const metadata = await client.gameMetadata.getGame({ gameCode: 1, season: 2023 });

console.log(metadata);
