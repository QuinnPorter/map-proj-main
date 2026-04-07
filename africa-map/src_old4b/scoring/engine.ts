import type { CountryResult, PillarScore, PillarWeights, HardFilters } from '../types';
import { COUNTRY_DATA } from '../data/countryData';

// ─── Pillar metadata ──────────────────────────────────────────────────────────

export const PILLARS: { id: keyof PillarWeights; name: string; shortName: string; color: string }[] = [
  { id: 'political',     name: 'Political & Policy Stability',     shortName: 'Political',     color: '#4f86c6' },
  { id: 'ruleOfLaw',    name: 'Rule of Law & Property Rights',    shortName: 'Rule of Law',   color: '#6b9e6f' },
  { id: 'fx',           name: 'FX Convertibility & Capital Flow', shortName: 'FX & Capital',  color: '#c4885a' },
  { id: 'macro',        name: 'Macroeconomic Stability',          shortName: 'Macro',         color: '#9b6db5' },
  { id: 'marketDepth',  name: 'Market Depth & Exitability',       shortName: 'Market Depth',  color: '#c4a94b' },
  { id: 'infrastructure', name: 'Infrastructure & Operating Env.', shortName: 'Infrastructure',color: '#5aabb5' },
  { id: 'growth',       name: 'Growth Opportunity',               shortName: 'Growth',        color: '#c46b7a' },
];

// ─── Default weights ──────────────────────────────────────────────────────────

export const DEFAULT_WEIGHTS: PillarWeights = {
  political: 15, ruleOfLaw: 18, fx: 14, macro: 13,
  marketDepth: 15, infrastructure: 12, growth: 13,
};

// ─── Compute weighted score for a single country ─────────────────────────────

function weightedScore(pillars: PillarScore[], weights: PillarWeights): number {
  let total = 0;
  let weightUsed = 0;

  for (const p of pillars) {
    const w = weights[p.id as keyof PillarWeights] ?? 0;
    if (p.score >= 0) {
      total += p.score * (w / 100);
      weightUsed += w;
    }
  }

  // Re-normalise if some pillars are pending
  if (weightUsed > 0 && weightUsed < 100) {
    return Math.round((total / weightUsed) * 100);
  }
  return Math.round(total);
}

// ─── Build pillar scores for one country ─────────────────────────────────────

function buildPillars(d: (typeof COUNTRY_DATA)[0]): PillarScore[] {
  const political: PillarScore = {
    id: 'political', name: 'Political & Policy Stability',
    score: d.pillar_political, weight: 0, confidence: 'high',
    drivers: [
      `Political stability: ${d.politicalStabilityText}`,
      `Insurgency: ${d.insurgencyText.substring(0, 60)}`,
      `Democracy score: ${d.democracyPct}`,
    ],
  };

  const ruleOfLaw: PillarScore = {
    id: 'ruleOfLaw', name: 'Rule of Law & Property Rights',
    score: d.pillar_ruleOfLaw, weight: 0, confidence: 'high',
    drivers: [
      `Contract enforcement: ${d.contractEnforcementText}`,
      `Corruption: ${d.corruptionText}`,
      `Human rights: ${d.humanRightsText}`,
      `Land ownership: ${d.landOwnershipText}`,
    ],
  };

  const fx: PillarScore = {
    id: 'fx', name: 'FX Convertibility & Capital Flow',
    score: d.pillar_fx, weight: 0, confidence: 'pending',
    drivers: ['FX convertibility data: coming soon', 'Capital controls data: coming soon'],
  };

  const macro: PillarScore = {
    id: 'macro', name: 'Macroeconomic Stability',
    score: d.pillar_macro, weight: 0, confidence: 'pending',
    drivers: ['Inflation / debt data: coming soon'],
  };

  const marketDepth: PillarScore = {
    id: 'marketDepth', name: 'Market Depth & Exitability',
    score: d.pillar_marketDepth, weight: 0, confidence: 'pending',
    drivers: ['Market liquidity data: coming soon', 'Stock market / exit data: coming soon'],
  };

  const infrastructure: PillarScore = {
    id: 'infrastructure', name: 'Infrastructure & Operating Env.',
    score: d.pillar_infrastructure, weight: 0,
    confidence: d.pillar_infrastructure >= 0 ? 'medium' : 'pending',
    drivers: d.pillar_infrastructure >= 0
      ? ['Derived from subnational data: infrastructure quality, power reliability, port efficiency']
      : ['Subnational data not yet available for this country'],
  };

  const growth: PillarScore = {
    id: 'growth', name: 'Growth Opportunity',
    score: d.pillar_growth, weight: 0, confidence: 'medium',
    drivers: [
      `Population: ${d.population}`,
      `10yr population growth: ${d.popChangePct}`,
    ],
  };

  return [political, ruleOfLaw, fx, macro, marketDepth, infrastructure, growth];
}

// ─── Check hard filters ───────────────────────────────────────────────────────

function checkFilters(d: (typeof COUNTRY_DATA)[0], filters: HardFilters): string[] {
  const reasons: string[] = [];

  if (filters.excludeWeakContracts) {
    const ct = d.contractEnforcementText.toLowerCase();
    if (ct.includes('weak')) {
      reasons.push('Weak contract enforcement (your red line)');
    }
  }

  if (filters.maxPoliticalDisruption === 'none') {
    const ps = d.politicalStabilityText.toLowerCase();
    if (ps.includes('low') || ps.includes('fragile') || ps.includes('moderate')) {
      reasons.push('Political stability below your threshold');
    }
  } else if (filters.maxPoliticalDisruption === 'low') {
    const ps = d.politicalStabilityText.toLowerCase();
    if (ps.includes('low') || ps.includes('fragile')) {
      reasons.push('Political instability exceeds your tolerance');
    }
    const ins = d.insurgencyText.toLowerCase();
    if (ins.includes('active') || ins.includes('conflict')) {
      reasons.push('Active insurgency/conflict (your red line)');
    }
  }

  return reasons;
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function scoreCountries(
  weights: PillarWeights = DEFAULT_WEIGHTS,
  filters: HardFilters = {
    excludeCapitalControls: false,
    excludeWeakContracts: false,
    maxPoliticalDisruption: 'moderate',
    requireLiquidity: false,
  },
): CountryResult[] {
  // Build results
  const results: CountryResult[] = COUNTRY_DATA.map(d => {
    const pillars = buildPillars(d);
    const exclusionReasons = checkFilters(d, filters);
    const excluded = exclusionReasons.length > 0;

    const defaultScore = weightedScore(pillars, DEFAULT_WEIGHTS);
    const customScore = excluded ? 0 : weightedScore(pillars, weights);

    // Top strengths & constraints (from non-pending pillars)
    const available = pillars.filter(p => p.score >= 0);
    const sorted = [...available].sort((a, b) => b.score - a.score);
    const topStrengths = sorted.slice(0, 2).map(p => `${p.name} (${p.score}/100)`);
    const topConstraints = sorted.slice(-2).reverse().map(p => `${p.name} (${p.score}/100)`);

    return {
      name: d.name, iso: d.iso,
      population: d.population, economicCommunity: d.economicCommunity,
      nextElection: d.nextElection, corporateTax: d.corporateTax,
      vatTax: d.vatTax, resDividendTax: d.resDividendTax,
      nonResDividendTax: d.nonResDividendTax, legalSystem: d.legalSystem,
      politicalStabilityText: d.politicalStabilityText,
      contractEnforcementText: d.contractEnforcementText,
      corruptionText: d.corruptionText, humanRightsText: d.humanRightsText,
      landOwnershipText: d.landOwnershipText, insurgencyText: d.insurgencyText,
      crimeScore: d.crimeScore,
      pillars, defaultScore, customScore,
      defaultRank: 0, customRank: 0, rankChange: 0,
      excluded, exclusionReasons,
      topStrengths, topConstraints,
    };
  });

  // Assign default ranks
  const defaultSorted = [...results].sort((a, b) => b.defaultScore - a.defaultScore);
  defaultSorted.forEach((r, i) => { r.defaultRank = i + 1; });

  // Assign custom ranks
  const customSorted = [...results].sort((a, b) => {
    if (a.excluded && !b.excluded) return 1;
    if (!a.excluded && b.excluded) return -1;
    return b.customScore - a.customScore;
  });
  customSorted.forEach((r, i) => { r.customRank = i + 1; });

  results.forEach(r => { r.rankChange = r.defaultRank - r.customRank; });

  return results;
}

export function getDefaultRanking(): CountryResult[] {
  return scoreCountries(DEFAULT_WEIGHTS, {
    excludeCapitalControls: false,
    excludeWeakContracts: false,
    maxPoliticalDisruption: 'high',
    requireLiquidity: false,
  });
}
