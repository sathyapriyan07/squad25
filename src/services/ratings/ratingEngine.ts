import type { PlayerWithDetails, TeamRatingBreakdown } from '../../types/ipl';

export interface RatingWeights {
  batting: number;
  bowling: number;
  allRounder: number;
  wicketkeeping: number;
  squadDepth: number;
}

export const DEFAULT_RATING_WEIGHTS: RatingWeights = {
  batting: 0.35,
  bowling: 0.3,
  allRounder: 0.15,
  wicketkeeping: 0.1,
  squadDepth: 0.1,
};

function avgTop(values: number[], count: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => b - a).slice(0, count);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  // Penalize slightly if fewer than target count exist
  const coverage = Math.min(1, sorted.length / count);
  return Math.round((sum / sorted.length) * (0.65 + 0.35 * coverage));
}

export function calculateTeamRatings(
  squadPlayers: PlayerWithDetails[],
  weights: RatingWeights = DEFAULT_RATING_WEIGHTS
): TeamRatingBreakdown {
  if (squadPlayers.length === 0) {
    return {
      battingStrength: 0,
      bowlingStrength: 0,
      paceStrength: 0,
      spinStrength: 0,
      allRounderStrength: 0,
      wicketkeepingStrength: 0,
      squadDepth: 0,
      overallRating: 0,
    };
  }

  // Batting: top 7 batters/WK/AR weighted composite
  const battingScores = squadPlayers
    .filter((p) => p.primaryRole !== 'BOWL' || p.ratings.batting >= 45)
    .map(
      (p) =>
        p.ratings.batting * 0.45 +
        p.ratings.technique * 0.25 +
        p.ratings.powerHitting * 0.15 +
        p.ratings.finishing * 0.15
    );
  const battingStrength = Math.min(100, avgTop(battingScores, 7));

  // Pace strength: top 4 pace options
  const paceScores = squadPlayers
    .map((p) => p.ratings.paceBowling)
    .filter((score) => score >= 45);
  const paceStrength = Math.min(100, avgTop(paceScores, 4));

  // Spin strength: top 3 spin options
  const spinScores = squadPlayers
    .map((p) => p.ratings.spinBowling)
    .filter((score) => score >= 45);
  const spinStrength = Math.min(100, avgTop(spinScores, 3));

  // Bowling strength: best 5 bowlers across pace & spin
  const bestBowlerScores = squadPlayers
    .map((p) => Math.max(p.ratings.paceBowling, p.ratings.spinBowling))
    .filter((score) => score >= 45);
  const top5Bowl = avgTop(bestBowlerScores, 5);
  const balanceBonus = paceScores.length >= 2 && spinScores.length >= 2 ? 4 : 0;
  const bowlingStrength = Math.min(
    100,
    Math.round(top5Bowl * 0.65 + (paceStrength * 0.55 + spinStrength * 0.45) * 0.35 + balanceBonus)
  );

  // All-rounders: top 3 ARs or dual-threat players
  const arScores = squadPlayers
    .filter(
      (p) =>
        p.primaryRole === 'AR' ||
        (p.ratings.batting >= 60 && Math.max(p.ratings.paceBowling, p.ratings.spinBowling) >= 60)
    )
    .map(
      (p) =>
        p.ratings.batting * 0.45 +
        Math.max(p.ratings.paceBowling, p.ratings.spinBowling) * 0.45 +
        p.ratings.fielding * 0.1
    );
  const allRounderStrength = Math.min(100, avgTop(arScores, 3));

  // Wicketkeeping: best 1-2 wicketkeepers
  const wkScores = squadPlayers
    .filter((p) => p.isWicketkeeper || p.primaryRole === 'WK' || p.ratings.wicketkeeping >= 60)
    .map((p) => p.ratings.wicketkeeping * 0.6 + p.ratings.batting * 0.4);
  const wicketkeepingStrength = Math.min(100, avgTop(wkScores, 2));

  // Squad depth: quality of players ranked 12..18 + size coverage toward 18
  const sortedOverall = [...squadPlayers].map((p) => p.ratings.overall).sort((a, b) => b - a);
  const bench = sortedOverall.slice(11, 18);
  const benchAvg = bench.length > 0 ? bench.reduce((a, b) => a + b, 0) / bench.length : sortedOverall[sortedOverall.length - 1] * 0.7;
  const sizeFactor = Math.min(1, squadPlayers.length / 18);
  const squadDepth = Math.min(100, Math.round(benchAvg * (0.45 + 0.55 * sizeFactor)));

  const overallRating = Math.min(
    100,
    Math.round(
      battingStrength * weights.batting +
        bowlingStrength * weights.bowling +
        allRounderStrength * weights.allRounder +
        wicketkeepingStrength * weights.wicketkeeping +
        squadDepth * weights.squadDepth
    )
  );

  return {
    battingStrength,
    bowlingStrength,
    paceStrength,
    spinStrength,
    allRounderStrength,
    wicketkeepingStrength,
    squadDepth,
    overallRating,
  };
}
