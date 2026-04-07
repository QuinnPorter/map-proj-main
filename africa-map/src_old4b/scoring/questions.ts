import type { Question, Answers, PillarWeights, HardFilters, InvestorProfile } from '../types';

// ─── Questions ───────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // Section 1: Profile
  {
    id: 'investorType',
    section: 'profile',
    text: 'What best describes your investment approach?',
    options: [
      { value: 'public', label: 'Public markets investor' },
      { value: 'pe', label: 'Private equity investor' },
      { value: 'venture', label: 'Venture / growth investor' },
      { value: 'corporate', label: 'Strategic corporate / FDI' },
      { value: 'credit', label: 'Lender / private credit' },
      { value: 'impact', label: 'Impact / development investor' },
    ],
  },
  {
    id: 'horizon',
    section: 'profile',
    text: 'What is your typical investment horizon?',
    options: [
      { value: 'short', label: 'Under 2 years' },
      { value: 'medium', label: '2–5 years' },
      { value: 'long', label: '5–10 years' },
      { value: 'vlong', label: '10+ years' },
    ],
  },
  {
    id: 'exitImportance',
    section: 'profile',
    text: 'How important is being able to exit quickly?',
    options: [
      { value: 'essential', label: 'Essential' },
      { value: 'important', label: 'Important' },
      { value: 'useful', label: 'Useful but not critical' },
      { value: 'low', label: 'Not very important' },
    ],
  },
  {
    id: 'returnPreference',
    section: 'profile',
    text: 'Which best describes your return preference?',
    options: [
      { value: 'preserve', label: 'Preserve capital, limit downside' },
      { value: 'balanced', label: 'Balanced risk and return' },
      { value: 'growth', label: 'Willing to take risk for higher upside' },
      { value: 'longterm', label: 'Primarily seeking long-term upside' },
    ],
  },

  // Section 2: Tradeoffs
  {
    id: 'propertyVsPolitical',
    section: 'tradeoffs',
    text: 'If two markets offered similar returns, which would you prefer?',
    options: [
      { value: 'property', label: 'Stronger property-rights protection' },
      { value: 'political', label: 'Greater political stability' },
      { value: 'both', label: 'Both matter equally' },
    ],
  },
  {
    id: 'growthVsMacro',
    section: 'tradeoffs',
    text: 'Which matters more to you?',
    options: [
      { value: 'growth', label: 'Faster growth potential' },
      { value: 'macro', label: 'Lower macroeconomic volatility' },
      { value: 'both', label: 'Both matter equally' },
    ],
  },
  {
    id: 'repatriationVsMarket',
    section: 'tradeoffs',
    text: 'Which matters more to you?',
    options: [
      { value: 'repatriation', label: 'Ease of capital repatriation' },
      { value: 'market', label: 'Larger domestic market opportunity' },
      { value: 'both', label: 'Both matter equally' },
    ],
  },
  {
    id: 'legalVsInfra',
    section: 'tradeoffs',
    text: 'Which would make you more comfortable investing?',
    options: [
      { value: 'legal', label: 'Stronger legal & regulatory predictability' },
      { value: 'infra', label: 'Better infrastructure & operating environment' },
      { value: 'both', label: 'Both matter equally' },
    ],
  },
  {
    id: 'riskTolerance',
    section: 'tradeoffs',
    text: 'Which fits your strategy better?',
    options: [
      { value: 'stability', label: 'Prefer stability even if upside is lower' },
      { value: 'upside', label: 'Can tolerate short-term instability for long-term upside' },
      { value: 'moderate', label: 'Moderate exposure to both' },
    ],
  },

  // Section 3: Red lines
  {
    id: 'capitalControls',
    section: 'redlines',
    text: 'Would meaningful capital controls rule out a market for you?',
    options: [
      { value: 'yes', label: 'Yes, definitely' },
      { value: 'usually', label: 'Usually yes' },
      { value: 'sometimes', label: 'Only in some cases' },
      { value: 'no', label: 'No, not necessarily' },
    ],
  },
  {
    id: 'contractEnforcement',
    section: 'redlines',
    text: 'Would weak contract enforcement rule out a market for you?',
    options: [
      { value: 'yes', label: 'Yes, definitely' },
      { value: 'usually', label: 'Usually yes' },
      { value: 'sometimes', label: 'Only in some cases' },
      { value: 'no', label: 'No, not necessarily' },
    ],
  },
  {
    id: 'politicalDisruption',
    section: 'redlines',
    text: 'How much political disruption can you tolerate?',
    options: [
      { value: 'veryLow', label: 'Very little' },
      { value: 'moderate', label: 'A moderate amount' },
      { value: 'high', label: 'High, if returns justify it' },
    ],
  },
];

// ─── Default base weights by investor type ───────────────────────────────────

const BASE_WEIGHTS: Record<string, PillarWeights> = {
  public: { political: 15, ruleOfLaw: 10, fx: 20, macro: 15, marketDepth: 25, infrastructure: 5, growth: 10 },
  pe:     { political: 15, ruleOfLaw: 20, fx: 15, macro: 10, marketDepth: 15, infrastructure: 10, growth: 15 },
  venture:{ political: 10, ruleOfLaw: 15, fx: 10, macro: 10, marketDepth: 10, infrastructure: 10, growth: 35 },
  corporate:{ political: 15, ruleOfLaw: 15, fx: 15, macro: 10, marketDepth: 10, infrastructure: 20, growth: 15 },
  credit: { political: 20, ruleOfLaw: 20, fx: 20, macro: 20, marketDepth: 10, infrastructure: 5, growth: 5 },
  impact: { political: 15, ruleOfLaw: 20, fx: 10, macro: 10, marketDepth: 5, infrastructure: 20, growth: 20 },
  default:{ political: 15, ruleOfLaw: 18, fx: 14, macro: 13, marketDepth: 15, infrastructure: 12, growth: 13 },
};

// ─── Map answers → weights & filters ────────────────────────────────────────

export function deriveProfile(answers: Answers): InvestorProfile {
  const type = answers.investorType ?? 'default';
  const w = { ...(BASE_WEIGHTS[type] ?? BASE_WEIGHTS.default) };

  // Horizon adjustments
  if (answers.horizon === 'short') { w.macro += 5; w.growth -= 5; }
  if (answers.horizon === 'vlong') { w.growth += 5; w.macro -= 5; }

  // Exit importance
  if (answers.exitImportance === 'essential') { w.marketDepth += 5; w.growth -= 5; }
  if (answers.exitImportance === 'low')       { w.marketDepth -= 5; w.growth += 5; }

  // Return preference
  if (answers.returnPreference === 'preserve') { w.political += 5; w.ruleOfLaw += 3; w.growth -= 8; }
  if (answers.returnPreference === 'longterm') { w.growth += 8; w.political -= 5; w.macro -= 3; }

  // Tradeoffs
  if (answers.propertyVsPolitical === 'property') { w.ruleOfLaw += 5; w.political -= 5; }
  if (answers.propertyVsPolitical === 'political') { w.political += 5; w.ruleOfLaw -= 5; }

  if (answers.growthVsMacro === 'growth') { w.growth += 6; w.macro -= 6; }
  if (answers.growthVsMacro === 'macro')  { w.macro += 6; w.growth -= 6; }

  if (answers.repatriationVsMarket === 'repatriation') { w.fx += 7; w.growth -= 7; }
  if (answers.repatriationVsMarket === 'market')        { w.growth += 7; w.fx -= 7; }

  if (answers.legalVsInfra === 'legal') { w.ruleOfLaw += 5; w.infrastructure -= 5; }
  if (answers.legalVsInfra === 'infra') { w.infrastructure += 5; w.ruleOfLaw -= 5; }

  if (answers.riskTolerance === 'stability') { w.political += 5; w.macro += 3; w.growth -= 8; }
  if (answers.riskTolerance === 'upside')    { w.growth += 8; w.political -= 5; w.macro -= 3; }

  // Normalise weights to 100
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  const keys = Object.keys(w) as (keyof PillarWeights)[];
  keys.forEach(k => { w[k] = Math.max(2, Math.round((w[k] / total) * 100)); });
  // Fix rounding drift
  const newTotal = Object.values(w).reduce((a, b) => a + b, 0);
  w.growth += (100 - newTotal);

  // Hard filters
  const filters: HardFilters = {
    excludeCapitalControls: answers.capitalControls === 'yes' || answers.capitalControls === 'usually',
    excludeWeakContracts:   answers.contractEnforcement === 'yes' || answers.contractEnforcement === 'usually',
    maxPoliticalDisruption: (answers.politicalDisruption as HardFilters['maxPoliticalDisruption']) ?? 'moderate',
    requireLiquidity: answers.exitImportance === 'essential',
  };

  // Profile label
  const typeLabels: Record<string, string> = {
    public: 'Public Markets', pe: 'Private Equity', venture: 'Venture / Growth',
    corporate: 'Strategic Corporate', credit: 'Private Credit', impact: 'Impact Investor',
  };
  const horizonLabels: Record<string, string> = {
    short: 'short-term', medium: 'medium-term', long: 'long-term', vlong: 'very long-term',
  };
  const label = `${typeLabels[type] ?? 'Investor'} · ${horizonLabels[answers.horizon] ?? ''} horizon`;

  // Description
  const priorities: string[] = [];
  const sortedW = keys.sort((a, b) => w[b] - w[a]);
  const pillarNames: Record<string, string> = {
    political: 'political stability', ruleOfLaw: 'rule of law', fx: 'capital mobility',
    macro: 'macro stability', marketDepth: 'market depth', infrastructure: 'infrastructure', growth: 'growth opportunity',
  };
  priorities.push(pillarNames[sortedW[0]], pillarNames[sortedW[1]], pillarNames[sortedW[2]]);
  const description = `Your profile prioritises ${priorities[0]}, ${priorities[1]}, and ${priorities[2]}.`;

  return { weights: w, filters, label, description };
}
