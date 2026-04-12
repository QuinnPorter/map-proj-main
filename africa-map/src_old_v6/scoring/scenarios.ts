import type { CountryResult } from '../types';

export interface Scenario {
  id: string;
  label: string;
  icon: string;
  description: string;
  rationale: string;
  source: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'none',
    label: 'No scenario',
    icon: '📊',
    description: 'Base scores only',
    rationale: '',
    source: '',
  },
  {
    id: 'election',
    label: 'Election Year',
    icon: '🗳️',
    description: 'Applies political risk premium to countries with elections due within 12 months',
    rationale: 'Political uncertainty typically spikes in election years across African markets, deterring short-term capital. Chatham House (2026) notes elections in Zambia, South Africa, Angola, Kenya, and Nigeria as near-term volatility triggers.',
    source: 'Chatham House (2026); Ackah-Baidoo et al., Global Studies Quarterly (2024)',
  },
  {
    id: 'fxStress',
    label: 'FX Stress',
    icon: '💱',
    description: 'Penalises countries with historical FX volatility or thin foreign reserves',
    rationale: 'IMF (2023) WEO analysis shows FX and capital flow restrictions increase investor vulnerability. Chatham House (2023) noted Ghana and Ethiopia sovereign debt at distressed levels, with cascading FX effects on capital mobility.',
    source: 'IMF WEO April 2023; Chatham House 2023; ISS Africa Futures 2026',
  },
  {
    id: 'commodityShock',
    label: 'Commodity Downturn',
    icon: '🛢️',
    description: 'Reduces scores for oil and mineral exporters; boosts diversified economies',
    rationale: 'Ackah-Baidoo et al. (2024) show FDI in resource-intensive SSA countries is primarily sensitive to macro uncertainty. A commodity price shock directly undermines the FDI case for resource economies while improving relative attractiveness of diversified markets.',
    source: 'Ackah-Baidoo et al., Global Studies Quarterly (2024); Asiedu (2006), The World Economy',
  },
  {
    id: 'reformUpside',
    label: 'Reform Upside',
    icon: '📈',
    description: 'Boosts countries with strong reform momentum and governance improvement trajectories',
    rationale: 'Njuguna & Nnadozie (2022, Journal of African Trade) show ease-of-doing-business improvements positively predict FDI even after controlling for resources. Countries improving governance attract more investment from lower-corruption origin countries (Belgibayeva & Plekhanov 2019).',
    source: 'Njuguna & Nnadozie, Journal of African Trade (2022); World Bank ease-of-doing-business legacy data',
  },
  {
    id: 'globalRiskOff',
    label: 'Global Risk-Off',
    icon: '🌐',
    description: 'Penalises frontier and high-volatility markets; rewards stable, liquid, large economies',
    rationale: 'IMF (2023) analysis of geoeconomic fragmentation shows non-aligned developing economies are particularly vulnerable when global uncertainty rises. UNCTAD (2024) confirms FDI into developing countries fell 30% in 2023, with frontier markets hit hardest.',
    source: 'IMF WEO April 2023; UNCTAD World Investment Report 2024; MIGA (2024) Shifting Shores',
  },
];

// Countries with elections within ~12 months (from your national data)
const ELECTION_YEAR_COUNTRIES = new Set([
  'Zambia', 'South Africa', 'Angola', 'Kenya', 'Nigeria',
  'Benin', 'Tanzania', 'Uganda', 'Ethiopia', 'Togo',
]);

// Resource-intensive countries
const RESOURCE_COUNTRIES = new Set([
  'Algeria', 'Angola', 'Cameroon', 'Chad', 'Republic of Congo',
  'Equatorial Guinea', 'Gabon', 'Libya', 'Nigeria', 'South Sudan',
  'Sudan', 'DR Congo', 'Zambia', 'Botswana', 'Sierra Leone', 'Guinea',
]);

// Countries with strong reform momentum (based on data)
const REFORM_COUNTRIES = new Set([
  'Rwanda', 'Mauritius', 'Morocco', 'Cabo Verde', 'Botswana',
  'Seychelles', 'Ghana', 'Senegal', 'Ivory Coast', 'Tanzania', 'Kenya',
]);

// Countries with FX vulnerability signals
const FX_VULNERABLE = new Set([
  'Ethiopia', 'Ghana', 'Sudan', 'South Sudan', 'Zimbabwe',
  'Nigeria', 'Angola', 'Burundi', 'Mozambique', 'Zambia',
]);

// Stable / larger economies that hold up under risk-off
const RISK_OFF_RESILIENT = new Set([
  'South Africa', 'Morocco', 'Egypt', 'Kenya', 'Mauritius',
  'Botswana', 'Namibia', 'Rwanda', 'Cabo Verde', 'Seychelles',
]);

export function applyScenario(results: CountryResult[], scenarioId: string): CountryResult[] {
  if (scenarioId === 'none') return results;

  return results.map(r => {
    let adjustment = 0;

    switch (scenarioId) {
      case 'election':
        if (ELECTION_YEAR_COUNTRIES.has(r.name)) adjustment = -10;
        break;

      case 'fxStress':
        if (FX_VULNERABLE.has(r.name)) adjustment = -14;
        else if (RISK_OFF_RESILIENT.has(r.name)) adjustment = +4;
        break;

      case 'commodityShock':
        if (RESOURCE_COUNTRIES.has(r.name)) adjustment = -12;
        else if (REFORM_COUNTRIES.has(r.name)) adjustment = +6;
        break;

      case 'reformUpside':
        if (REFORM_COUNTRIES.has(r.name)) adjustment = +12;
        break;

      case 'globalRiskOff':
        if (RISK_OFF_RESILIENT.has(r.name)) adjustment = +8;
        else if (r.customScore < 50) adjustment = -10;
        else adjustment = -4;
        break;
    }

    const newCustomScore = Math.max(0, Math.min(100, r.customScore + adjustment));
    const newDefaultScore = Math.max(0, Math.min(100, r.defaultScore + adjustment));

    return {
      ...r,
      customScore: newCustomScore,
      defaultScore: newDefaultScore,
    };
  });
}
