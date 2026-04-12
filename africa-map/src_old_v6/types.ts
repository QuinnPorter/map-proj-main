// ─── Core data types ────────────────────────────────────────────────────────

export interface PillarScore {
  id: string;
  name: string;
  score: number;          // 0–100, or -1 if data pending
  weight: number;         // 0–1, user-adjusted
  confidence: 'high' | 'medium' | 'low' | 'pending';
  drivers: string[];      // plain-English explanations
}

export interface CountryResult {
  name: string;
  iso: string;
  population: string;
  economicCommunity: string;
  nextElection: string;
  corporateTax: string;
  vatTax: string;
  resDividendTax: string;
  nonResDividendTax: string;
  legalSystem: string;
  // Raw text fields for display
  politicalStabilityText: string;
  contractEnforcementText: string;
  corruptionText: string;
  humanRightsText: string;
  landOwnershipText: string;
  insurgencyText: string;
  crimeScore: number;
  // New macro/FX/market fields
  gdpPerCapita?: string;
  gdpGrowth?: string;
  inflation?: string;
  debtGdp?: string;
  fxConvertibility?: string;
  stockExchange?: string;
  doingBusiness?: string;
  naturalResources?: string;

  pillars: PillarScore[];
  defaultScore: number;   // 0–100
  customScore: number;    // 0–100
  defaultRank: number;
  customRank: number;
  excluded: boolean;
  exclusionReasons: string[];
  topStrengths: string[];
  topConstraints: string[];
  rankChange: number;     // customRank – defaultRank (negative = moved up)
}

// ─── Questionnaire types ────────────────────────────────────────────────────

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: 'profile' | 'tradeoffs' | 'redlines' | 'importance';
  text: string;
  options: QuestionOption[];
}

export type Answers = Record<string, string>;

// ─── Investor profile / weights ─────────────────────────────────────────────

export interface PillarWeights {
  political: number;
  ruleOfLaw: number;
  fx: number;
  macro: number;
  marketDepth: number;
  infrastructure: number;
  growth: number;
}

export interface HardFilters {
  excludeCapitalControls: boolean;
  excludeWeakContracts: boolean;
  maxPoliticalDisruption: 'none' | 'low' | 'moderate' | 'high';
  requireLiquidity: boolean;
}

export interface InvestorProfile {
  weights: PillarWeights;
  filters: HardFilters;
  label: string;
  description: string;
  answerTrace: import('./scoring/questions').AnswerTraceItem[];
  answers: Record<string, string>;
}

// ─── App state ──────────────────────────────────────────────────────────────

export type AppState = 'landing' | 'questionnaire' | 'results';
