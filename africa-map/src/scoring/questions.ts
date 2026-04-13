import type { Question, Answers, PillarWeights, HardFilters, InvestorProfile } from '../types';

export const QUESTIONS: Question[] = [
  // ── Section 1: Profile ──────────────────────────────────────────────────────
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
    id: 'sectorFocus',
    section: 'profile',
    text: 'Which sector best describes your primary focus?',
    options: [
      { value: 'diversified', label: 'Diversified / no sector preference' },
      { value: 'infrastructure', label: 'Infrastructure & energy' },
      { value: 'fintech', label: 'Financial services & fintech' },
      { value: 'agri', label: 'Agriculture & food systems' },
      { value: 'manufacturing', label: 'Manufacturing & industrials' },
      { value: 'realestate', label: 'Real estate & property' },
      { value: 'extractives', label: 'Extractives & natural resources' },
      { value: 'tech', label: 'Technology & digital' },
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
  {
    id: 'currencyPreference',
    section: 'profile',
    text: 'What are your currency return requirements?',
    options: [
      { value: 'hardRequired', label: 'Hard currency (USD/EUR) returns required' },
      { value: 'hardPreferred', label: 'Hard currency preferred but not essential' },
      { value: 'localOk', label: 'Local currency returns acceptable' },
      { value: 'hedged', label: 'Returns depend on available hedging options' },
    ],
  },
  {
    id: 'ownershipStructure',
    section: 'profile',
    text: 'What ownership structure do you typically require?',
    options: [
      { value: 'majority', label: 'Majority stake (>50%) required' },
      { value: 'significant', label: 'Significant minority (25–50%)' },
      { value: 'minority', label: 'Minority stake acceptable' },
      { value: 'flexible', label: 'Flexible — depends on the deal' },
    ],
  },
  {
    id: 'localPartner',
    section: 'profile',
    text: 'How important is having an established local partner?',
    options: [
      { value: 'essential', label: 'Essential — will not invest without one' },
      { value: 'preferred', label: 'Strongly preferred' },
      { value: 'helpful', label: 'Helpful but not required' },
      { value: 'notNeeded', label: 'Not a key consideration' },
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

  // ── Section 2: Tradeoffs ────────────────────────────────────────────────────
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

  // ── Section 3: ESG & constraints ───────────────────────────────────────────
  {
    id: 'esgConstraints',
    section: 'redlines',
    text: 'Do you have ESG or impact constraints that exclude certain markets?',
    options: [
      { value: 'strict', label: 'Yes — strict ESG screening applies' },
      { value: 'soft', label: 'Yes — ESG is a factor but not a hard exclude' },
      { value: 'none', label: 'No formal ESG constraints' },
      { value: 'positiveImpact', label: 'Positive impact required, not just ESG screening' },
    ],
  },
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
  {
    id: 'sanctionsFilter',
    section: 'redlines',
    text: 'Would active UN, US, or EU sanctions rule out a market for you?',
    options: [
      { value: 'yes', label: 'Yes — sanctioned markets are a hard exclude' },
      { value: 'usually', label: 'Usually yes, with rare exceptions' },
      { value: 'sometimes', label: 'Only comprehensive sanctions; targeted is acceptable' },
      { value: 'no', label: 'No — I assess sanctions case by case' },
    ],
  },
  {
    id: 'nationalisationFilter',
    section: 'redlines',
    text: 'Would high nationalisation / expropriation risk rule out a market?',
    options: [
      { value: 'yes', label: 'Yes — recent expropriation history is a hard exclude' },
      { value: 'usually', label: 'Usually yes' },
      { value: 'sometimes', label: 'Only if risk is very high (e.g. active seizures)' },
      { value: 'no', label: 'No — I price in political risk separately' },
    ],
  },

  // ── Section 4: People & talent ─────────────────────────────────────────────
  {
    id: 'talentAccess',
    section: 'people',
    text: 'How important is access to university-educated local talent?',
    options: [
      { value: 'critical', label: 'Critical — we need a strong graduate pipeline on the ground' },
      { value: 'important', label: 'Important — we prefer it' },
      { value: 'useful', label: 'Useful but not a deciding factor' },
      { value: 'notNeeded', label: 'Not important for our operating model' },
    ],
  },
  {
    id: 'workforceType',
    section: 'people',
    text: 'What type of local workforce does your investment primarily need?',
    options: [
      { value: 'graduate', label: 'Highly skilled / graduate professionals' },
      { value: 'technical', label: 'Technical / vocational skills' },
      { value: 'semiskilled', label: 'Semi-skilled / operational labour' },
      { value: 'minimal', label: 'Minimal local workforce — remote or capital-light model' },
    ],
  },
  {
    id: 'fdiOpenness',
    section: 'people',
    text: 'How important is the country\'s openness to foreign investors and expat staff?',
    options: [
      { value: 'veryImportant', label: 'Very important — we need a welcoming environment' },
      { value: 'important', label: 'Important but manageable' },
      { value: 'canNavigate', label: 'We can navigate friction if the opportunity is strong' },
      { value: 'notConcern', label: 'Not a major concern for our structure' },
    ],
  },

  // ── Section 5: Infrastructure ──────────────────────────────────────────────
  {
    id: 'powerReliability',
    section: 'infrastructure',
    text: 'How critical is reliable power supply — no loadshedding — to your operations?',
    options: [
      { value: 'critical', label: 'Critical — outages would halt our operations' },
      { value: 'important', label: 'Important — we need mostly reliable power' },
      { value: 'manageable', label: 'Manageable — we can run backup generation' },
      { value: 'irrelevant', label: 'Not relevant to our investment model' },
    ],
  },
  {
    id: 'logisticsImportance',
    section: 'infrastructure',
    text: 'How important is logistics quality — ports, roads, rail — to your strategy?',
    options: [
      { value: 'essential', label: 'Essential — we depend on export or import corridors' },
      { value: 'important', label: 'Important' },
      { value: 'useful', label: 'Useful but not a deciding factor' },
      { value: 'notRelevant', label: 'Not relevant to our model' },
    ],
  },
  {
    id: 'sezRelevance',
    section: 'infrastructure',
    text: 'Would access to a Special Economic Zone (SEZ) be relevant to your investment?',
    options: [
      { value: 'essential', label: 'Yes — essential for our operating model' },
      { value: 'helpful', label: 'Helpful but not critical' },
      { value: 'notRelevant', label: 'Not particularly relevant' },
      { value: 'unsure', label: 'Unsure at this stage' },
    ],
  },

  // ── Section 6: Permits & governance ───────────────────────────────────────
  {
    id: 'approvalTolerance',
    section: 'permits',
    text: 'What is the maximum approval timeline you can tolerate to enter a market?',
    options: [
      { value: 'under3', label: 'Under 3 months' },
      { value: 'under6', label: '3–6 months' },
      { value: 'under12', label: '6–12 months' },
      { value: 'over12', label: 'Over 12 months if the opportunity justifies it' },
    ],
  },
  {
    id: 'judicialImportance',
    section: 'permits',
    text: 'How important is judicial independence to your investment decision?',
    options: [
      { value: 'essential', label: 'Essential — weak courts are a dealbreaker' },
      { value: 'veryImportant', label: 'Very important' },
      { value: 'important', label: 'Important but not a dealbreaker' },
      { value: 'lessImportant', label: 'Less important for our structure' },
    ],
  },
  {
    id: 'bureaucracyTolerance',
    section: 'permits',
    text: 'How much bureaucratic friction can your team absorb?',
    options: [
      { value: 'veryLittle', label: 'Very little — we need efficient, streamlined approvals' },
      { value: 'moderate', label: 'Moderate friction is manageable' },
      { value: 'experienced', label: 'We are experienced with complex jurisdictions' },
      { value: 'highOk', label: 'High friction is acceptable for the right return' },
    ],
  },

  // ── Section 7: Hedging ─────────────────────────────────────────────────────
  {
    id: 'hedgeInterest',
    section: 'hedging',
    text: 'Are you open to a multi-country strategy to diversify risk?',
    options: [
      { value: 'yes', label: 'Yes — this is important to my strategy' },
      { value: 'possibly', label: 'Possibly — show me the options' },
      { value: 'no', label: 'No — single-country focus for now' },
    ],
  },
  {
    id: 'hedgeType',
    section: 'hedging',
    text: 'If hedging, what type of risk are you most looking to offset?',
    options: [
      { value: 'political', label: 'Political / governance risk' },
      { value: 'fx', label: 'FX / capital mobility risk' },
      { value: 'power', label: 'Power / infrastructure risk' },
      { value: 'approval', label: 'Approval / bureaucracy risk' },
      { value: 'all', label: 'All of the above' },
    ],
  },

  // ── Section 8: Importance ranking ──────────────────────────────────────────
  {
    id: 'mostImportantFactor',
    section: 'importance',
    text: 'Looking back at all your answers, which factor matters most to your investment decisions?',
    options: [
      { value: 'political', label: 'Political & policy stability' },
      { value: 'ruleOfLaw', label: 'Rule of law & property rights' },
      { value: 'fx', label: 'Capital repatriation & FX access' },
      { value: 'macro', label: 'Macroeconomic stability' },
      { value: 'marketDepth', label: 'Market depth & exit options' },
      { value: 'infrastructure', label: 'Infrastructure & operating environment' },
      { value: 'growth', label: 'Growth opportunity & market size' },
      { value: 'businessEnv', label: 'Business environment, sanctions & nationalisation risk' },
    ],
  },
  {
    id: 'leastImportantFactor',
    section: 'importance',
    text: 'Which factor matters least to your investment decisions?',
    options: [
      { value: 'political', label: 'Political & policy stability' },
      { value: 'ruleOfLaw', label: 'Rule of law & property rights' },
      { value: 'fx', label: 'Capital repatriation & FX access' },
      { value: 'macro', label: 'Macroeconomic stability' },
      { value: 'marketDepth', label: 'Market depth & exit options' },
      { value: 'infrastructure', label: 'Infrastructure & operating environment' },
      { value: 'growth', label: 'Growth opportunity & market size' },
      { value: 'businessEnv', label: 'Business environment, sanctions & nationalisation risk' },
    ],
  },
];

// ─── Base weights by investor type ───────────────────────────────────────────

const BASE_WEIGHTS: Record<string, PillarWeights> = {
  public:    { political: 14, ruleOfLaw: 10, fx: 18, macro: 14, marketDepth: 22, infrastructure: 5,  growth: 10, businessEnv: 7 },
  pe:        { political: 13, ruleOfLaw: 18, fx: 13, macro: 9,  marketDepth: 13, infrastructure: 9,  growth: 13, businessEnv: 12 },
  venture:   { political: 9,  ruleOfLaw: 13, fx: 9,  macro: 9,  marketDepth: 9,  infrastructure: 9,  growth: 30, businessEnv: 12 },
  corporate: { political: 13, ruleOfLaw: 13, fx: 13, macro: 9,  marketDepth: 9,  infrastructure: 18, growth: 13, businessEnv: 12 },
  credit:    { political: 18, ruleOfLaw: 18, fx: 18, macro: 18, marketDepth: 9,  infrastructure: 5,  growth: 5,  businessEnv: 9  },
  impact:    { political: 13, ruleOfLaw: 18, fx: 9,  macro: 9,  marketDepth: 5,  infrastructure: 18, growth: 18, businessEnv: 10 },
  default:   { political: 14, ruleOfLaw: 16, fx: 13, macro: 12, marketDepth: 13, infrastructure: 11, growth: 12, businessEnv: 9  },
};

const SECTOR_ADJUSTMENTS: Record<string, Partial<PillarWeights>> = {
  infrastructure: { infrastructure: +8, fx: +4, macro: -4, marketDepth: -8 },
  fintech:        { ruleOfLaw: +6, marketDepth: +6, infrastructure: -4, macro: -4, growth: -4 },
  agri:           { infrastructure: +6, ruleOfLaw: +4, growth: +4, marketDepth: -8, fx: -6 },
  manufacturing:  { infrastructure: +8, political: +4, marketDepth: -6, growth: -6 },
  realestate:     { ruleOfLaw: +10, infrastructure: +4, fx: +4, marketDepth: -10, growth: -8 },
  extractives:    { political: +6, fx: +6, ruleOfLaw: +4, marketDepth: -8, growth: -8 },
  tech:           { growth: +8, marketDepth: +6, infrastructure: +4, macro: -8, political: -10 },
  diversified:    {},
};

// ─── Derive profile from answers ─────────────────────────────────────────────

export function deriveProfile(answers: Answers): InvestorProfile {
  const type = answers.investorType ?? 'default';
  const w = { ...(BASE_WEIGHTS[type] ?? BASE_WEIGHTS.default) };

  // Sector overlay
  const sector = answers.sectorFocus ?? 'diversified';
  const sectorAdj = SECTOR_ADJUSTMENTS[sector] ?? {};
  Object.entries(sectorAdj).forEach(([k, v]) => {
    if (k in w) (w as Record<string, number>)[k] += v as number;
  });

  // Horizon
  if (answers.horizon === 'short') { w.macro += 5; w.growth -= 5; }
  if (answers.horizon === 'vlong') { w.growth += 5; w.macro -= 5; }

  // Exit importance
  if (answers.exitImportance === 'essential') { w.marketDepth += 5; w.growth -= 5; }
  if (answers.exitImportance === 'low')       { w.marketDepth -= 5; w.growth += 5; }

  // Return preference
  if (answers.returnPreference === 'preserve') { w.political += 5; w.ruleOfLaw += 3; w.growth -= 8; }
  if (answers.returnPreference === 'longterm') { w.growth += 8; w.political -= 5; w.macro -= 3; }

  // Currency preference
  if (answers.currencyPreference === 'hardRequired') { w.fx += 8; w.growth -= 8; }
  if (answers.currencyPreference === 'hardPreferred') { w.fx += 4; w.growth -= 4; }
  if (answers.currencyPreference === 'localOk')       { w.fx -= 4; w.growth += 4; }

  // Ownership structure
  if (answers.ownershipStructure === 'majority')   { w.ruleOfLaw += 5; w.political += 3; w.marketDepth -= 8; }
  if (answers.ownershipStructure === 'minority')   { w.marketDepth += 5; w.ruleOfLaw -= 5; }

  // Local partner
  if (answers.localPartner === 'essential')  { w.infrastructure -= 4; w.ruleOfLaw += 4; }
  if (answers.localPartner === 'notNeeded')  { w.infrastructure += 4; w.ruleOfLaw -= 4; }

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

  // People & talent
  if (answers.talentAccess === 'critical')   { w.infrastructure += 4; w.growth += 3; w.macro -= 7; }
  if (answers.workforceType === 'graduate')  { w.growth += 3; w.infrastructure += 3; w.macro -= 6; }
  if (answers.fdiOpenness === 'veryImportant') { w.political += 3; w.ruleOfLaw += 3; w.growth -= 6; }

  // Infrastructure
  if (answers.powerReliability === 'critical')    { w.infrastructure += 7; w.growth -= 7; }
  if (answers.powerReliability === 'manageable')  { w.infrastructure -= 3; w.growth += 3; }
  if (answers.logisticsImportance === 'essential') { w.infrastructure += 5; w.marketDepth -= 5; }
  if (answers.sezRelevance === 'essential')        { w.infrastructure += 3; w.ruleOfLaw += 2; w.growth -= 5; }

  // Permits & governance
  if (answers.approvalTolerance === 'under3')   { w.ruleOfLaw += 4; w.marketDepth += 3; w.growth -= 7; }
  if (answers.approvalTolerance === 'over12')   { w.growth += 5; w.ruleOfLaw -= 5; }
  if (answers.judicialImportance === 'essential') { w.ruleOfLaw += 6; w.growth -= 6; }
  if (answers.judicialImportance === 'lessImportant') { w.ruleOfLaw -= 4; w.growth += 4; }
  if (answers.bureaucracyTolerance === 'veryLittle') { w.ruleOfLaw += 3; w.infrastructure += 3; w.growth -= 6; }

  // Importance ranking
  if (answers.mostImportantFactor && answers.mostImportantFactor in w) {
    (w as Record<string, number>)[answers.mostImportantFactor] += 8;
  }
  if (answers.leastImportantFactor && answers.leastImportantFactor in w) {
    (w as Record<string, number>)[answers.leastImportantFactor] -= 8;
  }

  // ESG
  if (answers.esgConstraints === 'strict' || answers.esgConstraints === 'positiveImpact') {
    w.ruleOfLaw += 4; w.political += 3; w.growth -= 7;
  }

  // Normalise to 100, floor each at 2
  const keys = Object.keys(w) as (keyof PillarWeights)[];
  keys.forEach(k => { w[k] = Math.max(2, w[k]); });
  const total = keys.reduce((a, k) => a + w[k], 0);
  keys.forEach(k => { w[k] = Math.max(2, Math.round((w[k] / total) * 100)); });
  const newTotal = keys.reduce((a, k) => a + w[k], 0);
  w.growth = Math.max(2, w.growth + (100 - newTotal));

  // Hard filters
  const filters: HardFilters = {
    excludeCapitalControls: answers.capitalControls === 'yes' || answers.capitalControls === 'usually',
    excludeWeakContracts:   answers.contractEnforcement === 'yes' || answers.contractEnforcement === 'usually',
    maxPoliticalDisruption: (answers.politicalDisruption as HardFilters['maxPoliticalDisruption']) ?? 'moderate',
    requireLiquidity: answers.exitImportance === 'essential',
    excludeSanctionedCountries: answers.sanctionsFilter === 'yes' || answers.sanctionsFilter === 'usually',
    excludeHighNationalisationRisk: answers.nationalisationFilter === 'yes' || answers.nationalisationFilter === 'usually',
  };

  // Build label
  const typeLabels: Record<string, string> = {
    public: 'Public Markets', pe: 'Private Equity', venture: 'Venture / Growth',
    corporate: 'Strategic Corporate', credit: 'Private Credit', impact: 'Impact Investor',
  };
  const sectorLabels: Record<string, string> = {
    diversified: '', infrastructure: ' · Infrastructure', fintech: ' · Fintech',
    agri: ' · Agriculture', manufacturing: ' · Manufacturing', realestate: ' · Real Estate',
    extractives: ' · Extractives', tech: ' · Technology',
  };
  const horizonLabels: Record<string, string> = {
    short: 'short-term', medium: 'medium-term', long: 'long-term', vlong: 'very long-term',
  };
  const label = `${typeLabels[type] ?? 'Investor'}${sectorLabels[sector] ?? ''} · ${horizonLabels[answers.horizon] ?? 'undefined'} horizon`;

  const sorted = [...keys].sort((a, b) => w[b] - w[a]);
  const pillarNames: Record<string, string> = {
    political: 'political stability', ruleOfLaw: 'rule of law', fx: 'capital mobility',
    macro: 'macro stability', marketDepth: 'market depth', infrastructure: 'infrastructure', growth: 'growth opportunity',
  };
  const description = `Prioritises ${pillarNames[sorted[0]]}, ${pillarNames[sorted[1]]}, and ${pillarNames[sorted[2]]}.`;

  const answerTrace = buildAnswerTrace(answers, w);

  return { weights: w, filters, label, description, answerTrace, answers };
}

// ─── Answer trace ─────────────────────────────────────────────────────────────

export interface AnswerTraceItem {
  questionText: string;
  answerLabel: string;
  pillarEffects: { pillar: string; delta: number }[];
}

function buildAnswerTrace(answers: Answers, _finalWeights: PillarWeights): AnswerTraceItem[] {
  const trace: AnswerTraceItem[] = [];

  const qMap: Record<string, string> = {
    investorType: 'Investment approach', sectorFocus: 'Sector focus',
    horizon: 'Time horizon', returnPreference: 'Return preference',
    currencyPreference: 'Currency requirement', ownershipStructure: 'Ownership structure',
    localPartner: 'Local partner importance', exitImportance: 'Exit importance',
    propertyVsPolitical: 'Property rights vs stability', growthVsMacro: 'Growth vs macro',
    repatriationVsMarket: 'Repatriation vs market size', legalVsInfra: 'Legal vs infrastructure',
    riskTolerance: 'Risk tolerance', esgConstraints: 'ESG constraints',
    capitalControls: 'Capital controls red line', contractEnforcement: 'Contract enforcement red line',
    politicalDisruption: 'Political disruption tolerance',
    talentAccess: 'Talent access importance', workforceType: 'Workforce type needed',
    fdiOpenness: 'Openness to foreign investors', powerReliability: 'Power reliability importance',
    logisticsImportance: 'Logistics quality importance', sezRelevance: 'SEZ relevance',
    approvalTolerance: 'Approval timeline tolerance', judicialImportance: 'Judicial independence',
    bureaucracyTolerance: 'Bureaucratic friction tolerance',
    hedgeInterest: 'Multi-country strategy interest', hedgeType: 'Hedge risk type',
    mostImportantFactor: 'Most important factor', leastImportantFactor: 'Least important factor',
  };

  const effectMap: Record<string, Record<string, { pillar: string; delta: number }[]>> = {
    currencyPreference: {
      hardRequired: [{ pillar: 'FX & Capital', delta: +8 }, { pillar: 'Growth', delta: -8 }],
      hardPreferred: [{ pillar: 'FX & Capital', delta: +4 }, { pillar: 'Growth', delta: -4 }],
      localOk: [{ pillar: 'FX & Capital', delta: -4 }, { pillar: 'Growth', delta: +4 }],
    },
    propertyVsPolitical: {
      property: [{ pillar: 'Rule of Law', delta: +5 }, { pillar: 'Political', delta: -5 }],
      political: [{ pillar: 'Political', delta: +5 }, { pillar: 'Rule of Law', delta: -5 }],
    },
    growthVsMacro: {
      growth: [{ pillar: 'Growth', delta: +6 }, { pillar: 'Macro', delta: -6 }],
      macro:  [{ pillar: 'Macro', delta: +6 }, { pillar: 'Growth', delta: -6 }],
    },
    repatriationVsMarket: {
      repatriation: [{ pillar: 'FX & Capital', delta: +7 }, { pillar: 'Growth', delta: -7 }],
      market:        [{ pillar: 'Growth', delta: +7 }, { pillar: 'FX & Capital', delta: -7 }],
    },
    legalVsInfra: {
      legal: [{ pillar: 'Rule of Law', delta: +5 }, { pillar: 'Infrastructure', delta: -5 }],
      infra: [{ pillar: 'Infrastructure', delta: +5 }, { pillar: 'Rule of Law', delta: -5 }],
    },
    riskTolerance: {
      stability: [{ pillar: 'Political', delta: +5 }, { pillar: 'Macro', delta: +3 }, { pillar: 'Growth', delta: -8 }],
      upside:    [{ pillar: 'Growth', delta: +8 }, { pillar: 'Political', delta: -5 }, { pillar: 'Macro', delta: -3 }],
    },
    powerReliability: {
      critical:   [{ pillar: 'Infrastructure', delta: +7 }, { pillar: 'Growth', delta: -7 }],
      manageable: [{ pillar: 'Infrastructure', delta: -3 }, { pillar: 'Growth', delta: +3 }],
    },
    logisticsImportance: {
      essential: [{ pillar: 'Infrastructure', delta: +5 }, { pillar: 'Market Depth', delta: -5 }],
    },
    judicialImportance: {
      essential:      [{ pillar: 'Rule of Law', delta: +6 }, { pillar: 'Growth', delta: -6 }],
      lessImportant:  [{ pillar: 'Rule of Law', delta: -4 }, { pillar: 'Growth', delta: +4 }],
    },
    approvalTolerance: {
      under3: [{ pillar: 'Rule of Law', delta: +4 }, { pillar: 'Market Depth', delta: +3 }, { pillar: 'Growth', delta: -7 }],
      over12: [{ pillar: 'Growth', delta: +5 }, { pillar: 'Rule of Law', delta: -5 }],
    },
    mostImportantFactor: {
      political:     [{ pillar: 'Political', delta: +8 }],
      ruleOfLaw:     [{ pillar: 'Rule of Law', delta: +8 }],
      fx:            [{ pillar: 'FX & Capital', delta: +8 }],
      macro:         [{ pillar: 'Macro', delta: +8 }],
      marketDepth:   [{ pillar: 'Market Depth', delta: +8 }],
      infrastructure:[{ pillar: 'Infrastructure', delta: +8 }],
      growth:        [{ pillar: 'Growth', delta: +8 }],
      businessEnv:   [{ pillar: 'Business Env.', delta: +8 }],
    },
    leastImportantFactor: {
      political:     [{ pillar: 'Political', delta: -8 }],
      ruleOfLaw:     [{ pillar: 'Rule of Law', delta: -8 }],
      fx:            [{ pillar: 'FX & Capital', delta: -8 }],
      macro:         [{ pillar: 'Macro', delta: -8 }],
      marketDepth:   [{ pillar: 'Market Depth', delta: -8 }],
      infrastructure:[{ pillar: 'Infrastructure', delta: -8 }],
      growth:        [{ pillar: 'Growth', delta: -8 }],
      businessEnv:   [{ pillar: 'Business Env.', delta: -8 }],
    },
  };

  const qTexts: Record<string, string[][]> = {
    investorType: [['public','Public markets'],['pe','Private equity'],['venture','Venture/growth'],['corporate','Strategic corporate'],['credit','Private credit'],['impact','Impact investor']],
    sectorFocus: [['diversified','Diversified'],['infrastructure','Infrastructure'],['fintech','Fintech'],['agri','Agriculture'],['manufacturing','Manufacturing'],['realestate','Real estate'],['extractives','Extractives'],['tech','Technology']],
    horizon: [['short','Under 2 years'],['medium','2–5 years'],['long','5–10 years'],['vlong','10+ years']],
    returnPreference: [['preserve','Preserve capital'],['balanced','Balanced'],['growth','Risk for upside'],['longterm','Long-term upside']],
    currencyPreference: [['hardRequired','Hard currency required'],['hardPreferred','Hard currency preferred'],['localOk','Local currency OK'],['hedged','Depends on hedging']],
    ownershipStructure: [['majority','Majority required'],['significant','Significant minority'],['minority','Minority OK'],['flexible','Flexible']],
    localPartner: [['essential','Essential'],['preferred','Strongly preferred'],['helpful','Helpful'],['notNeeded','Not needed']],
    exitImportance: [['essential','Essential'],['important','Important'],['useful','Useful'],['low','Not important']],
    propertyVsPolitical: [['property','Property rights'],['political','Political stability'],['both','Both equally']],
    growthVsMacro: [['growth','Growth'],['macro','Macro stability'],['both','Both equally']],
    repatriationVsMarket: [['repatriation','Repatriation'],['market','Market size'],['both','Both equally']],
    legalVsInfra: [['legal','Legal predictability'],['infra','Infrastructure'],['both','Both equally']],
    riskTolerance: [['stability','Prefer stability'],['upside','Tolerate instability for upside'],['moderate','Moderate']],
    esgConstraints: [['strict','Strict ESG'],['soft','Soft ESG'],['none','No ESG'],['positiveImpact','Positive impact required']],
    capitalControls: [['yes','Yes — red line'],['usually','Usually yes'],['sometimes','Sometimes'],['no','No']],
    contractEnforcement: [['yes','Yes — red line'],['usually','Usually yes'],['sometimes','Sometimes'],['no','No']],
    politicalDisruption: [['veryLow','Very little'],['moderate','Moderate'],['high','High if returns justify']],
    talentAccess: [['critical','Critical'],['important','Important'],['useful','Useful'],['notNeeded','Not needed']],
    workforceType: [['graduate','Graduate professionals'],['technical','Technical/vocational'],['semiskilled','Semi-skilled'],['minimal','Minimal workforce']],
    fdiOpenness: [['veryImportant','Very important'],['important','Important'],['canNavigate','Can navigate friction'],['notConcern','Not a concern']],
    powerReliability: [['critical','Critical'],['important','Important'],['manageable','Manageable'],['irrelevant','Not relevant']],
    logisticsImportance: [['essential','Essential'],['important','Important'],['useful','Useful'],['notRelevant','Not relevant']],
    sezRelevance: [['essential','Essential'],['helpful','Helpful'],['notRelevant','Not relevant'],['unsure','Unsure']],
    approvalTolerance: [['under3','Under 3 months'],['under6','3–6 months'],['under12','6–12 months'],['over12','Over 12 months']],
    judicialImportance: [['essential','Essential'],['veryImportant','Very important'],['important','Important'],['lessImportant','Less important']],
    bureaucracyTolerance: [['veryLittle','Very little'],['moderate','Moderate'],['experienced','Experienced'],['highOk','High OK']],
    hedgeInterest: [['yes','Yes — important'],['possibly','Possibly'],['no','No']],
    hedgeType: [['political','Political/governance'],['fx','FX/capital'],['power','Power/infrastructure'],['approval','Approval/bureaucracy'],['all','All of the above']],
    mostImportantFactor: [['political','Political stability'],['ruleOfLaw','Rule of law'],['fx','Capital mobility'],['macro','Macro stability'],['marketDepth','Market depth'],['infrastructure','Infrastructure'],['growth','Growth']],
    leastImportantFactor: [['political','Political stability'],['ruleOfLaw','Rule of law'],['fx','Capital mobility'],['macro','Macro stability'],['marketDepth','Market depth'],['infrastructure','Infrastructure'],['growth','Growth']],
  };

  const QUESTIONS_MAP: Record<string, Record<string, string>> = {};
  Object.entries(qTexts).forEach(([qId, pairs]) => {
    QUESTIONS_MAP[qId] = Object.fromEntries(pairs);
  });

  Object.entries(answers).forEach(([qId, val]) => {
    if (!val) return;
    const effects = effectMap[qId]?.[val] ?? [];
    trace.push({
      questionText: qMap[qId] ?? qId,
      answerLabel: QUESTIONS_MAP[qId]?.[val] ?? val,
      pillarEffects: effects,
    });
  });

  return trace;
}
