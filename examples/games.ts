import { EuroleagueClient } from "../src";

const client = new EuroleagueClient({ competition: "euroleague" });

const report = await client.games.getReport({ gameCode: 1, season: 2023 });
const stats = await client.games.getStats({ gameCode: 1, season: 2023 });
const pointsBreakdown = await client.games.getPointsBreakdown({ gameCode: 1, season: 2023 });
const comparison = await client.games.getComparison({ gameCode: 1, season: 2023 });
const scoreEvolution = await client.games.getScoreEvolution({ gameCode: 1, season: 2023 });

console.log(report);
console.log(stats);
console.log(pointsBreakdown);
console.log(comparison);
console.log(scoreEvolution);
