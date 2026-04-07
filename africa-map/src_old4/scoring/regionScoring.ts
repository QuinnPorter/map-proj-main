import type { PillarWeights } from '../types';
import { SUBNATIONAL_DATA, type RegionData } from '../data/subnationalData';

export interface ScoredRegion extends RegionData {
  profileScore: number;  // weighted score under user's profile
  rank: number;
  isBestFit: boolean;
}

// Map pillar weights to subnational score dimensions
function scoreRegionForProfile(region: RegionData, weights: PillarWeights): number {
  const s = region.scores;

  // Group subnational dimensions into pillar-relevant buckets
  const buckets: { pillar: keyof PillarWeights; scores: number[] }[] = [
    {
      pillar: 'political',
      scores: [s.governance, s.security, s.reformMomentum],
    },
    {
      pillar: 'ruleOfLaw',
      scores: [s.regulatoryPredictability, s.corruption, s.incentiveReliability],
    },
    {
      pillar: 'fx',
      scores: [s.tradeCorridor, s.marketAccess],
    },
    {
      pillar: 'macro',
      scores: [s.reformMomentum, s.governance],
    },
    {
      pillar: 'marketDepth',
      scores: [s.marketAccess, s.tradeCorridor, s.port],
    },
    {
      pillar: 'infrastructure',
      scores: [s.infrastructure, s.power, s.port, s.railConnectivity, s.waterAvailability],
    },
    {
      pillar: 'growth',
      scores: [s.laborAvailability, s.skillLevel, s.marketAccess, s.timeToStart],
    },
  ];

  let weightedTotal = 0;
  let weightUsed = 0;

  for (const bucket of buckets) {
    const valid = bucket.scores.filter(v => v >= 0);
    if (valid.length === 0) continue;
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    const w = weights[bucket.pillar] / 100;
    weightedTotal += avg * w;
    weightUsed += w;
  }

  if (weightUsed === 0) return region.compositeScore;
  return Math.round((weightedTotal / weightUsed));
}

export function getRegionsForCountry(
  countryName: string,
  weights: PillarWeights
): ScoredRegion[] {
  const regions = SUBNATIONAL_DATA[countryName];
  if (!regions || regions.length === 0) return [];

  const scored: ScoredRegion[] = regions.map(r => ({
    ...r,
    profileScore: scoreRegionForProfile(r, weights),
    rank: 0,
    isBestFit: false,
  }));

  // Sort by profile score
  scored.sort((a, b) => b.profileScore - a.profileScore);
  scored.forEach((r, i) => {
    r.rank = i + 1;
    r.isBestFit = i < 2;
  });

  return scored;
}

export const REGION_SCORE_LABELS: { key: keyof RegionData['scores']; label: string }[] = [
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'power', label: 'Power reliability' },
  { key: 'port', label: 'Port efficiency' },
  { key: 'governance', label: 'Governance quality' },
  { key: 'security', label: 'Security' },
  { key: 'laborAvailability', label: 'Labour availability' },
  { key: 'skillLevel', label: 'Skill level' },
  { key: 'reformMomentum', label: 'Reform momentum' },
  { key: 'corruption', label: 'Low corruption' },
  { key: 'regulatoryPredictability', label: 'Regulatory predictability' },
  { key: 'timeToStart', label: 'Ease of starting' },
  { key: 'railConnectivity', label: 'Rail connectivity' },
  { key: 'marketAccess', label: 'Market access' },
  { key: 'tradeCorridor', label: 'Trade corridor access' },
  { key: 'incentiveReliability', label: 'Incentive reliability' },
  { key: 'waterAvailability', label: 'Water availability' },
];
