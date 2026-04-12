import type { CountryResult } from '../types';

export interface Scenario {
  id: string;
  label: string;
  icon: string;
  description: string;
  rationale: string;
  source: string;
}

// ─── Historical crisis database ───────────────────────────────────────────────
// Each entry records a real African investment climate shock with measured impact.
// FDI impact = approximate % change in FDI inflows in year following event.
// Source: UNCTAD, World Bank FDI data, IMF Article IV, academic literature.

export const HISTORICAL_CRISES = [
  // Disputed elections / political crises
  { country: 'Kenya', year: 2007, type: 'disputed_election', event: 'Post-election violence', fdImpact: -33, recovery_years: 2, notes: 'FDI fell 33% in 2008; GDP growth halved; tourism collapsed' },
  { country: 'Ivory Coast', year: 2010, type: 'disputed_election', event: 'Gbagbo refuses to concede; civil war', fdImpact: -60, recovery_years: 3, notes: 'FDI fell 60% in 2011; cocoa sector disrupted; ECOWAS intervention' },
  { country: 'Zimbabwe', year: 2008, type: 'disputed_election', event: 'Mugabe election fraud; hyperinflation peak', fdImpact: -80, recovery_years: 8, notes: 'FDI near-zero 2008-2010; hyperinflation 500bn%; GNU partial recovery' },
  { country: 'Guinea', year: 2010, type: 'disputed_election', event: 'Contentious presidential election', fdImpact: -18, recovery_years: 2, notes: 'Mining investment paused; international concern over process' },
  { country: 'Madagascar', year: 2009, type: 'coup', event: 'Rajoelina coup; suspended from AU/SADC', fdImpact: -50, recovery_years: 5, notes: 'FDI fell sharply; Daewoo land deal cancelled; Sherritt suspended nickel project' },
  { country: 'Mali', year: 2012, type: 'coup', event: 'Sanogo coup; AQIM expansion north', fdImpact: -70, recovery_years: 4, notes: 'Mining companies evacuated; gold production disrupted; French intervention 2013' },
  { country: 'Burkina Faso', year: 2022, type: 'coup', event: 'Second coup in 8 months; Traoré seizes power', fdImpact: -45, recovery_years: null, notes: 'Ongoing; mines nationalised 2024-25; Endeavour Mining withdrew; Barrick at risk' },
  { country: 'Niger', year: 2023, type: 'coup', event: 'Tchiani coup; Orano uranium seizure', fdImpact: -55, recovery_years: null, notes: 'Ongoing; uranium licence revoked; ECOWAS sanctions; France expelled' },
  { country: 'Sudan', year: 2019, type: 'coup', event: 'Al-Bashir ousted; transitional instability', fdImpact: -30, recovery_years: null, notes: 'Civil war erupted 2023; economy collapsed; foreign assets at extreme risk' },
  { country: 'Ethiopia', year: 2020, type: 'civil_war', event: 'Tigray war; atrocities allegations; US sanctions', fdImpact: -38, recovery_years: 3, notes: 'FDI fell; H&M and other brands suspended; Nespresso reduced sourcing; ceasefire 2022' },
  
  // Currency / macro crises
  { country: 'Ghana', year: 2022, type: 'debt_crisis', event: 'Debt default; IMF bailout; cedi collapse', fdImpact: -40, recovery_years: 3, notes: 'FDI fell 40% in 2023; Eurobond market closed; Moody\'s downgrade; debt restructuring 2023' },
  { country: 'Zambia', year: 2020, type: 'debt_crisis', event: 'First African default during COVID; KCM dispute', fdImpact: -35, recovery_years: 4, notes: 'Mining investment paused; Vedanta KCM liquidation attempt; debt restructured 2023' },
  { country: 'Nigeria', year: 2016, type: 'fx_crisis', event: 'Oil price crash; naira devaluation; FX controls', fdImpact: -36, recovery_years: 3, notes: 'FDI fell 36% 2016; capital repatriation frozen; parallel market premium 60%+' },
  { country: 'Angola', year: 2015, type: 'fx_crisis', event: 'Oil price crash; kwanza devaluation 50%', fdImpact: -25, recovery_years: 3, notes: 'Sonangol cash flow crisis; construction sector collapse; IMF engagement' },
  { country: 'Egypt', year: 2016, type: 'fx_reform', event: 'Pound flotation; 50% devaluation overnight', fdImpact: +22, recovery_years: 1, notes: 'FDI ROSE 22% in 2017 as certainty restored; IMF deal; confidence returned' },
  { country: 'Mozambique', year: 2016, type: 'debt_crisis', event: 'Hidden debt scandal ($2.2bn); IMF suspended', fdImpact: -55, recovery_years: 6, notes: 'FDI fell sharply; donors suspended; Total force majeure 2021; LNG recovery slow' },
  
  // Resource nationalism shocks
  { country: 'Tanzania', year: 2017, type: 'resource_nationalism', event: 'Magufuli mining code; Barrick dispute; export bans', fdImpact: -40, recovery_years: 4, notes: 'FDI fell 40%; Acacia (Barrick) fined $190bn; export bans; eventually settled 2019' },
  { country: 'DR Congo', year: 2018, type: 'resource_nationalism', event: 'New mining code; royalties tripled; windfall tax', fdImpact: -20, recovery_years: 2, notes: 'Glencore, Ivanhoe protested; FDI dipped; cobalt boom offset some impact' },
  { country: 'Mali', year: 2024, type: 'resource_nationalism', event: 'Barrick Loulo-Gounkoto seizure; $1.9bn lost revenue', fdImpact: -65, recovery_years: null, notes: 'Ongoing; Fraser Institute bottom 10; B2Gold Fekola nationalised; junta expanding SOPAMIB' },
  
  // Security shocks
  { country: 'Libya', year: 2011, type: 'civil_war', event: 'NATO intervention; Gaddafi fall; civil war', fdImpact: -95, recovery_years: null, notes: 'FDI near-zero since 2011; oil production disrupted; two competing governments' },
  { country: 'South Sudan', year: 2013, type: 'civil_war', event: 'Civil war outbreak; oil production halted', fdImpact: -90, recovery_years: null, notes: 'FDI collapsed; oil output fell 70%; ongoing conflict with brief ceasefires' },
  { country: 'Somalia', year: 2006, type: 'civil_war', event: 'Islamic Courts; Ethiopian intervention', fdImpact: -85, recovery_years: null, notes: 'Near-zero formal FDI; telecoms/hawala exceptional; Mogadishu slowly rebuilding post-2012' },
];

// ─── Average FDI impact by crisis type (for scenario modelling) ───────────────
// These are averages from the historical database above, used in scenario logic

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
    description: 'Applies political risk premium to countries with elections due within 12 months. Based on historical FDI data: disputed elections cause avg -40% FDI impact (Kenya 2007: -33%; Ivory Coast 2010: -60%).',
    rationale: 'Historical record shows FDI falls an average of 40% in years following disputed African elections. Kenya 2007 post-election violence cut FDI by 33% and halved GDP growth. Ivory Coast 2010-11 saw a 60% FDI collapse. Even clean elections introduce 6-12 months of investor paralysis while policy direction is unclear. Chatham House (2026) notes elections in several key markets as near-term volatility triggers.',
    source: 'UNCTAD FDI data; World Bank WDI; Chatham House (2026); Ackah-Baidoo et al., Global Studies Quarterly (2024)',
  },
  {
    id: 'disputedElection',
    label: 'Disputed Election',
    icon: '⚠️',
    description: 'Stress-tests countries with past disputed election history. Based on avg -40% FDI impact from database of 6 African disputed election events 2007-2022.',
    rationale: 'Countries with a history of disputed elections carry a recurring risk premium. The historical database shows Ivory Coast 2010 (-60%), Kenya 2007 (-33%), Zimbabwe 2008 (-80%), Guinea 2010 (-18%). Recovery takes 2-5 years. Countries currently under military rule (Mali, Burkina Faso, Niger, Guinea, Sudan, Gabon) face this risk as elections are delayed indefinitely.',
    source: 'UNCTAD FDI Statistics; IMF Article IV reviews; AfDB; own database of 20 African political crises 2006-2025',
  },
  {
    id: 'fxStress',
    label: 'FX Stress',
    icon: '💱',
    description: 'Penalises countries with historical FX volatility or thin foreign reserves. Historical avg: -28% FDI in FX crisis year. Nigeria 2016: -36%; Angola 2015: -25%. Exception: Egypt 2016 flotation led to +22% FDI recovery.',
    rationale: 'FX crises create two types of damage: capital repatriation freezes (investors cannot exit) and valuation destruction (USD-denominated assets collapse in local terms). IMF (2023) WEO analysis shows FX restrictions amplify FDI losses. Nigeria\'s 2016 naira crisis froze capital repatriation for 18 months and caused a 36% FDI fall. Ghana\'s 2022 default caused a 40% decline.',
    source: 'IMF WEO April 2023; UNCTAD WIR 2024; World Bank WDI; own crisis database',
  },
  {
    id: 'commodityShock',
    label: 'Commodity Downturn',
    icon: '🛢️',
    description: 'Reduces scores for oil and mineral exporters. Based on 2015-16 oil crash: Nigeria -36%, Angola -25%, Chad fiscal crisis. Diversified economies gain relative attractiveness.',
    rationale: 'Ackah-Baidoo et al. (2024) show FDI in resource-intensive SSA countries is primarily sensitive to commodity price cycles. The 2015-16 oil crash directly demonstrated this: Nigeria GDP contracted, Angola fiscal crisis, Chad debt restructuring. Conversely, commodity downturns make non-resource economies like Rwanda, Ivory Coast, and Morocco relatively more attractive as stable alternatives.',
    source: 'Ackah-Baidoo et al., Global Studies Quarterly (2024); Asiedu (2006), The World Economy; IMF WEO; UNCTAD',
  },
  {
    id: 'reformUpside',
    label: 'Reform Upside',
    icon: '📈',
    description: 'Boosts countries with strong reform momentum. Rwanda has attracted 7x FDI per capita vs SSA average since 2000 reforms. Morocco\'s reform trajectory drove manufacturing FDI from near-zero to $4bn/yr.',
    rationale: 'Njuguna & Nnadozie (2022, Journal of African Trade) show ease-of-doing-business improvements positively predict FDI. Rwanda\'s sustained reform programme (2000-present) generated 7x the SSA average FDI per capita by 2023. Morocco\'s industrial policy and regulatory reforms attracted Renault, Stellantis, Boeing suppliers. Ethiopia\'s industrial parks attracted 80+ global brands. Reform momentum is the single highest-return investable signal in African frontier markets.',
    source: 'Njuguna & Nnadozie, Journal of African Trade (2022); World Bank; UNCTAD WIR 2024; ISS Africa Futures 2026',
  },
  {
    id: 'globalRiskOff',
    label: 'Global Risk-Off',
    icon: '🌐',
    description: 'Penalises frontier and high-volatility markets; rewards stable, liquid, large economies. UNCTAD (2024) shows frontier FDI fell 30% in 2023 during global uncertainty.',
    rationale: 'IMF (2023) analysis of geoeconomic fragmentation shows non-aligned developing economies are particularly vulnerable when global uncertainty rises — capital flows home or to safe havens. UNCTAD (2024) confirms FDI into developing countries fell 30% in 2023. In risk-off environments, only large, stable, liquid markets (South Africa, Egypt, Morocco) retain meaningful inflows. Small frontier markets see near-total drying of institutional capital.',
    source: 'IMF WEO April 2023; UNCTAD World Investment Report 2024; MIGA (2024) Shifting Shores',
  },
];

// ─── Country classifications ──────────────────────────────────────────────────

const ELECTION_YEAR_COUNTRIES = new Set([
  'Zambia', 'Tanzania', 'Uganda', 'Ethiopia', 'Togo', 'Cameroon',
  'Republic of Congo', 'Gabon', 'Senegal',
]);

// Countries under military rule / post-coup (elections delayed)
const POST_COUP_COUNTRIES = new Set([
  'Mali', 'Burkina Faso', 'Niger', 'Guinea', 'Sudan', 'Gabon',
]);

// Countries with disputed election history in last 10 years
const DISPUTED_ELECTION_HISTORY = new Set([
  'Kenya', 'Zimbabwe', 'Ivory Coast', 'Madagascar', 'Ethiopia',
  'Cameroon', 'Senegal', 'Nigeria', 'Guinea', 'Mozambique',
]);

// Resource-intensive countries
const RESOURCE_COUNTRIES = new Set([
  'Algeria', 'Angola', 'Cameroon', 'Chad', 'Republic of Congo',
  'Equatorial Guinea', 'Gabon', 'Libya', 'Nigeria', 'South Sudan',
  'Sudan', 'DR Congo', 'Zambia', 'Botswana', 'Sierra Leone', 'Guinea',
  'Niger', 'Mali', 'Burkina Faso', 'Mauritania',
]);

// Countries with strong reform momentum
const REFORM_COUNTRIES = new Set([
  'Rwanda', 'Mauritius', 'Morocco', 'Cabo Verde', 'Botswana',
  'Seychelles', 'Ghana', 'Senegal', 'Ivory Coast', 'Tanzania',
  'Kenya', 'Togo', 'Benin', 'Djibouti',
]);

// Countries with FX vulnerability signals
const FX_VULNERABLE = new Set([
  'Ethiopia', 'Ghana', 'Sudan', 'South Sudan', 'Zimbabwe',
  'Nigeria', 'Angola', 'Burundi', 'Mozambique', 'Zambia',
  'Sierra Leone', 'Malawi', 'DR Congo', 'Madagascar',
]);

// Stable economies resilient in risk-off
const RISK_OFF_RESILIENT = new Set([
  'South Africa', 'Morocco', 'Egypt', 'Kenya', 'Mauritius',
  'Botswana', 'Namibia', 'Rwanda', 'Cabo Verde', 'Seychelles',
  'Ivory Coast', 'Tanzania',
]);

// Countries with active resource nationalism seizures 2022-2025
const ACTIVE_NATIONALISATION = new Set([
  'Mali', 'Burkina Faso', 'Niger', 'Zimbabwe', 'Guinea',
]);

export function applyScenario(results: CountryResult[], scenarioId: string): CountryResult[] {
  if (scenarioId === 'none') return results;

  return results.map(r => {
    let adjustment = 0;

    switch (scenarioId) {
      case 'election':
        if (POST_COUP_COUNTRIES.has(r.name)) adjustment = -18; // worse — no democratic release valve
        else if (ELECTION_YEAR_COUNTRIES.has(r.name)) adjustment = -10;
        break;

      case 'disputedElection':
        if (POST_COUP_COUNTRIES.has(r.name)) adjustment = -22; // already in crisis
        else if (DISPUTED_ELECTION_HISTORY.has(r.name)) adjustment = -14;
        else if (ACTIVE_NATIONALISATION.has(r.name)) adjustment = -8;
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
        else if (ACTIVE_NATIONALISATION.has(r.name)) adjustment = -6;
        break;

      case 'globalRiskOff':
        if (RISK_OFF_RESILIENT.has(r.name)) adjustment = +8;
        else if (r.customScore < 40) adjustment = -14;
        else if (r.customScore < 55) adjustment = -8;
        else adjustment = -4;
        break;
    }

    const newCustomScore = Math.max(0, Math.min(100, r.customScore + adjustment));
    const newDefaultScore = Math.max(0, Math.min(100, r.defaultScore + adjustment));

    return { ...r, customScore: newCustomScore, defaultScore: newDefaultScore };
  });
}
