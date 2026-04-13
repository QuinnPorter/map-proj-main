// ─── Country intelligence layer ──────────────────────────────────────────────
// Ministry routing, hedge recommendations, approval timelines, people &
// infrastructure data. Separate from scoring engine — used by CountryDetail.

export interface Ministry {
  name: string;
  description: string;
  url: string;
  priority: 1 | 2 | 3;
  outreachNote: string;
  sectors: string[];
}

export interface HedgeRecommendation {
  countryName: string;
  iso: string;
  type: string;
  tags: string[];
  reasoning: string;
}

export interface ApprovalTimeline {
  sector: string;
  timeline: string;
  months: number;
}

export interface CountryIntelligence {
  iso: string;
  name: string;
  // People
  educationIndex: string;
  universities: string;
  workforceProfile: string;
  opennessToFDI: string;
  governmentPriorities: string[];
  // Infrastructure
  loadshedding: boolean;
  loadsheddingNote: string;
  utilitiesCost: string;
  logisticsQuality: string;
  connectivity: string;
  sezStatus: string;
  sezTenants: string[];
  // Permits
  judicialScore: string;
  democracyIndex: string;
  approvalTimelines: ApprovalTimeline[];
  majorProjects: string[];
  commonPartners: string[];
  // Take action
  ministries: Ministry[];
  // Hedge
  hedges: HedgeRecommendation[];
}

export const COUNTRY_INTELLIGENCE: CountryIntelligence[] = [
  {
    iso: 'ZA', name: 'South Africa',
    educationIndex: '0.72', universities: '26 accredited (Western Cape subnational)',
    workforceProfile: 'Skilled professional and technical workforce available across major metros',
    opennessToFDI: 'Very open — OECD FDI restrictiveness index 0.09 (low restriction)',
    governmentPriorities: ['Job creation', 'Beneficiation', 'Energy transition', 'Technology'],
    loadshedding: true,
    loadsheddingNote: 'Stage 2–4 average during 2024; improving trajectory in 2025 per Eskom briefings',
    utilitiesCost: 'Medium — $0.12/kWh industrial',
    logisticsQuality: 'Strong — Durban port, Cape Town, N3 corridor',
    connectivity: 'High — major submarine cable hub (WACS, ACE, SEACOM)',
    sezStatus: 'High activity — Coega IDZ, East London IDZ, Dube TradePort, Tshwane Auto SEZ',
    sezTenants: ['General Motors', 'Volkswagen', 'Beijing Auto'],
    judicialScore: '68/100 (WJP Rule of Law Index 2024)',
    democracyIndex: '7.1 — EIU flawed democracy',
    approvalTimelines: [
      { sector: 'Mining', timeline: '~14 months', months: 14 },
      { sector: 'Renewables', timeline: '~9 months', months: 9 },
      { sector: 'Manufacturing / SEZ', timeline: '~4 months', months: 4 },
      { sector: 'Tech / services', timeline: '~2 months', months: 2 },
    ],
    majorProjects: ['ACWA Power Kenhardt solar (2023)', 'BMW plant expansion (2023)', 'Shoprite logistics hub (2022)'],
    commonPartners: ['Botswana', 'Namibia', 'Mauritius'],
    ministries: [
      {
        name: 'Dept. of Trade, Industry and Competition (DTIC)',
        description: 'Primary FDI entry point — investment facilitation and incentives',
        url: 'https://www.thedtic.gov.za',
        priority: 1,
        outreachNote: 'Operation Vulindlela and Invest SA one-stop-shop are the flagship programmes. Lead with job creation numbers and local content commitments. Avoid foregrounding repatriation in initial contact.',
        sectors: ['manufacturing', 'tech', 'fintech', 'diversified'],
      },
      {
        name: 'Dept. of Mineral Resources and Energy (DMRE)',
        description: 'Mining rights, energy licences, sector-specific permits',
        url: 'https://www.dmr.gov.za',
        priority: 1,
        outreachNote: 'Beneficiation focus; MPRDA amendments ongoing. Frame investment around downstream processing and local employment, not pure extraction.',
        sectors: ['extractives', 'infrastructure'],
      },
      {
        name: 'National Treasury',
        description: 'Tax incentives, DFI access, financial structuring',
        url: 'https://www.treasury.gov.za',
        priority: 2,
        outreachNote: 'Section 12I incentives, IDC co-investment, blended finance. Focus on fiscal multipliers and private sector leverage ratios.',
        sectors: ['diversified', 'manufacturing', 'infrastructure'],
      },
      {
        name: 'Wesgro — Western Cape Investment Agency',
        description: 'Subnational investment promotion — fastest permit facilitation in RSA',
        url: 'https://www.wesgro.co.za',
        priority: 3,
        outreachNote: 'Concierge service above threshold deal size. Western Cape has above-average approval efficiency vs national average — worth using as entry point for Cape-based operations.',
        sectors: ['tech', 'fintech', 'agri', 'manufacturing'],
      },
    ],
    hedges: [
      { countryName: 'Botswana', iso: 'BW', type: 'Governance & stability hedge', tags: ['Top rule of law', 'No loadshedding', 'Stable FX'], reasoning: 'Botswana eliminates RSA\'s two largest operational risks: political volatility and energy unreliability. Standard Southern Africa pairing for mining and logistics strategies.' },
      { countryName: 'Namibia', iso: 'NA', type: 'Energy & infrastructure hedge', tags: ['Green hydrogen flagship', 'No loadshedding', 'Walvis Bay Atlantic access'], reasoning: 'Energy-sector upside without RSA\'s power risk. Walvis Bay provides Atlantic corridor access. Increasingly used as Southern Africa HQ jurisdiction.' },
      { countryName: 'Mauritius', iso: 'MU', type: 'Capital structure hedge', tags: ['Full capital repatriation', 'DTA network', 'Common law courts'], reasoning: 'Most PE Africa strategies hold through a Mauritius SPV. Eliminates FX repatriation risk and provides treaty protection. A structural rather than operating market.' },
    ],
  },
  {
    iso: 'KE', name: 'Kenya',
    educationIndex: '0.58', universities: '5+ accredited (Nairobi region)',
    workforceProfile: 'Growing tech talent pool; vocational skills gap in industrial sectors',
    opennessToFDI: 'Generally open; work permits have moderate friction (6–10 weeks)',
    governmentPriorities: ['Digital economy', 'Agriculture modernisation', 'Manufacturing', 'Financial inclusion'],
    loadshedding: false,
    loadsheddingNote: 'Intermittent outages improving with geothermal expansion; grid more reliable than Nigeria or RSA',
    utilitiesCost: 'Medium-high — $0.18/kWh industrial',
    logisticsQuality: 'Moderate — Mombasa port, SGR rail line to Nairobi',
    connectivity: 'Good — SEACOM / EASSy submarine cables',
    sezStatus: 'Moderate — Nairobi SEZ active, Dongo Kundu SEZ (Mombasa) under development',
    sezTenants: ['Safaricom', 'Various tech firms'],
    judicialScore: '52/100 (WJP 2024)',
    democracyIndex: '5.0 — EIU hybrid regime',
    approvalTimelines: [
      { sector: 'Technology', timeline: '~2 months', months: 2 },
      { sector: 'Agriculture', timeline: '~5 months', months: 5 },
      { sector: 'Manufacturing', timeline: '~8 months', months: 8 },
      { sector: 'Mining', timeline: '~12 months', months: 12 },
    ],
    majorProjects: ['M-KOPA solar expansion (2023)', 'Konza Technopolis (ongoing)', 'Two Rivers logistics hub (2022)'],
    commonPartners: ['Rwanda', 'Tanzania', 'Ethiopia'],
    ministries: [
      {
        name: 'Kenya Investment Authority (KenInvest)',
        description: 'Primary investment promotion — one-stop shop',
        url: 'https://www.invest.go.ke',
        priority: 1,
        outreachNote: 'Lead with digital economy and employment creation. Post-IMF programme Kenya is actively seeking FDI to support the shilling. Fintech and agri-tech receive preferential fast-tracking.',
        sectors: ['tech', 'fintech', 'agri', 'diversified'],
      },
      {
        name: 'Ministry of Energy & Petroleum',
        description: 'Energy licences, renewables, petroleum upstream and downstream',
        url: 'https://energy.go.ke',
        priority: 2,
        outreachNote: 'Geothermal and solar expansion is flagship. Frame around energy security, transition financing, and technology transfer.',
        sectors: ['infrastructure', 'extractives'],
      },
      {
        name: 'Ministry of ICT & Digital Economy',
        description: 'Tech licences, fintech regulation, data infrastructure',
        url: 'https://ict.go.ke',
        priority: 2,
        outreachNote: 'Kenya positions itself as Africa\'s tech hub. Lead with innovation credentials, digital skills pipeline, and regional market ambitions.',
        sectors: ['tech', 'fintech'],
      },
      {
        name: 'National Treasury & Planning',
        description: 'Tax incentives, SEZ approvals, fiscal framework',
        url: 'https://www.treasury.go.ke',
        priority: 3,
        outreachNote: 'SEZ fiscal incentives are strong. Focus on export orientation and technology transfer for Pioneer Status applications.',
        sectors: ['manufacturing', 'diversified'],
      },
    ],
    hedges: [
      { countryName: 'Rwanda', iso: 'RW', type: 'Governance quality hedge', tags: ['Top rule of law SSA', 'Fastest approvals', 'Zero corruption'], reasoning: 'Rwanda compensates for Kenya\'s judicial and governance gaps while accessing the same East Africa market. Natural pairing for two-market East Africa strategies.' },
      { countryName: 'Tanzania', iso: 'TZ', type: 'Market corridor hedge', tags: ['Port of Dar es Salaam', 'Large territory', 'Stable politics'], reasoning: 'Tanzania provides Southern corridor access and a larger stable domestic market. Useful for logistics and agribusiness investors bridging East and Southern Africa.' },
    ],
  },
  {
    iso: 'MA', name: 'Morocco',
    educationIndex: '0.64', universities: '12+ accredited (Casablanca, Rabat)',
    workforceProfile: 'Educated bilingual workforce (French / Arabic / English)',
    opennessToFDI: 'Very open — AMDIE single-window process is efficient and investor-friendly',
    governmentPriorities: ['Green hydrogen', 'Automotive / aerospace', 'Financial services hub', 'European market gateway'],
    loadshedding: false,
    loadsheddingNote: 'No loadshedding; reliable national grid with significant renewable capacity',
    utilitiesCost: 'Medium — $0.10/kWh industrial',
    logisticsQuality: 'Excellent — Tanger Med is the largest port in Africa',
    connectivity: 'Good — ATLAS cable system, improving with new connections',
    sezStatus: 'Active — Tanger Free Zone, Casablanca Finance City, Atlantic Free Zone Dakhla',
    sezTenants: ['Renault', 'Stellantis', 'Boeing', 'Airbus'],
    judicialScore: '55/100 (WJP 2024)',
    democracyIndex: '4.9 — EIU hybrid regime',
    approvalTimelines: [
      { sector: 'Tech / services', timeline: '~2 months', months: 2 },
      { sector: 'Manufacturing', timeline: '~4 months', months: 4 },
      { sector: 'Real estate', timeline: '~5 months', months: 5 },
      { sector: 'Energy', timeline: '~6 months', months: 6 },
    ],
    majorProjects: ['Noor Ouarzazate solar complex', 'Renault Tangier factory expansion', 'OCP phosphate processing expansion'],
    commonPartners: ['Senegal', 'Côte d\'Ivoire', 'Tunisia'],
    ministries: [
      {
        name: 'AMDIE — Moroccan Investment & Export Development Agency',
        description: 'Investment promotion and facilitation — single window for all sectors',
        url: 'https://www.invest.gov.ma',
        priority: 1,
        outreachNote: 'Efficient single-window. Lead with green transition, export capacity, and European market access. Morocco actively competes with Tunisia and Egypt for manufacturing FDI — demonstrate commitment to staying.',
        sectors: ['manufacturing', 'tech', 'diversified'],
      },
      {
        name: 'Ministry of Energy Transition & Sustainable Development',
        description: 'Renewables, green hydrogen, energy policy and licensing',
        url: 'https://www.mem.gov.ma',
        priority: 1,
        outreachNote: 'Green hydrogen is the flagship national programme. Frame around energy transition, export capacity to Europe, and technology localisation. Strong appetite for European investment partners.',
        sectors: ['infrastructure', 'extractives'],
      },
      {
        name: 'Ministry of Economy & Finance',
        description: 'Tax regime, incentives, Casablanca Finance City framework',
        url: 'https://www.finances.gov.ma',
        priority: 3,
        outreachNote: 'Casablanca Finance City offers preferential holding regime. Strong incentive packages for manufacturing including subsidised land, infrastructure, and training support.',
        sectors: ['fintech', 'realestate', 'diversified'],
      },
    ],
    hedges: [
      { countryName: 'Senegal', iso: 'SN', type: 'West Africa entry hedge', tags: ['ECOWAS gateway', 'Oil & gas upside', 'Democratic governance'], reasoning: 'Senegal provides West Africa coverage complementing Morocco\'s North Africa / European-pivot story. New oil discoveries add upside alongside Morocco\'s manufacturing base.' },
      { countryName: 'Côte d\'Ivoire', iso: 'CI', type: 'Francophone West Africa hedge', tags: ['Fastest-growing large economy', 'ECOWAS hub', 'CFA franc stability'], reasoning: 'The Abidjan–Casablanca corridor is a natural French-speaking investment axis for corporate investors wanting North + West Africa manufacturing and consumer presence.' },
    ],
  },
  {
    iso: 'RW', name: 'Rwanda',
    educationIndex: '0.52', universities: '3 accredited (Kigali)',
    workforceProfile: 'Young workforce; STEM investment accelerating under government programmes',
    opennessToFDI: 'Highly open — ranked #2 in Africa for ease of doing business; company registration under 6 hours',
    governmentPriorities: ['Technology and innovation hub', 'Financial services', 'Regional HQ attraction', 'Tourism'],
    loadshedding: false,
    loadsheddingNote: 'No loadshedding; 98% electrification achieved; reliable national grid',
    utilitiesCost: 'Medium-high — $0.20/kWh industrial',
    logisticsQuality: 'Limited — landlocked; relies on Tanzania and Kenya corridors',
    connectivity: 'Good — national fibre expansion programme underway',
    sezStatus: 'Moderate — Kigali SEZ active, Bugesera Industrial Park developing',
    sezTenants: ['Volkswagen (assembly)', 'Various logistics and tech firms'],
    judicialScore: '72/100 (WJP 2024 — highest in Sub-Saharan Africa)',
    democracyIndex: '3.1 — EIU authoritarian',
    approvalTimelines: [
      { sector: 'Technology', timeline: 'Under 1 month', months: 1 },
      { sector: 'Financial services', timeline: '~2 months', months: 2 },
      { sector: 'Manufacturing', timeline: '~3 months', months: 3 },
      { sector: 'Mining', timeline: '~5 months', months: 5 },
    ],
    majorProjects: ['Kigali Innovation City', 'Rwanda Finance Ltd hub', 'MTN Rwanda data centre expansion'],
    commonPartners: ['Kenya', 'Tanzania', 'Uganda'],
    ministries: [
      {
        name: 'Rwanda Development Board (RDB)',
        description: 'One-stop shop — investment, trade, tourism, company registration',
        url: 'https://rdb.rw',
        priority: 1,
        outreachNote: 'World-class one-stop-shop. Lead with technology, ESG alignment, and regional HQ positioning. Rwanda competes directly with Mauritius as a holding / HQ jurisdiction. Rwanda Finance Ltd handles financial sector specifically.',
        sectors: ['tech', 'fintech', 'diversified', 'agri'],
      },
      {
        name: 'Ministry of Finance & Economic Planning (MINECOFIN)',
        description: 'Fiscal incentives, financial sector oversight, development finance',
        url: 'https://www.minecofin.gov.rw',
        priority: 2,
        outreachNote: 'Strong incentives for financial sector and tech. Focus on long-term partnership and knowledge / skills transfer commitments.',
        sectors: ['fintech', 'tech', 'diversified'],
      },
      {
        name: 'Ministry of ICT & Innovation',
        description: 'Tech licences, fintech regulation, innovation policy',
        url: 'https://www.minict.gov.rw',
        priority: 2,
        outreachNote: 'Rwanda positions itself as Africa\'s Singapore. Lead with innovation credentials and commitment to building local digital capacity.',
        sectors: ['tech', 'fintech'],
      },
    ],
    hedges: [
      { countryName: 'Kenya', iso: 'KE', type: 'Market depth hedge', tags: ['Large consumer market', 'Fintech ecosystem', 'East Africa hub'], reasoning: 'Rwanda\'s governance is unmatched but its market is tiny. Kenya provides the consumer depth and financial ecosystem Rwanda lacks. The most common East Africa pairing.' },
      { countryName: 'Tanzania', iso: 'TZ', type: 'Southern corridor hedge', tags: ['Port of Dar es Salaam', 'Large territory', 'Natural resources'], reasoning: 'Tanzania gives Rwanda\'s landlocked operations a Southern corridor access point and a larger domestic market for regional distribution.' },
    ],
  },
  {
    iso: 'NG', name: 'Nigeria',
    educationIndex: '0.48', universities: '12+ accredited (Lagos)',
    workforceProfile: 'Large young urban workforce; technical skills gaps in formal sector',
    opennessToFDI: 'Moderate — NIPC process has significant bureaucratic friction; improving under Tinubu reforms',
    governmentPriorities: ['Oil & gas revenue stabilisation', 'Technology / fintech', 'Job creation', 'FX stabilisation'],
    loadshedding: true,
    loadsheddingNote: 'Severe — 20+ hours/day outages common outside Lagos; generator dependency endemic',
    utilitiesCost: 'Low (official $0.05–0.10/kWh) but actual cost much higher with mandatory generator infrastructure',
    logisticsQuality: 'Moderate — Lagos port congested; Lekki deep sea port improving 2023–24',
    connectivity: 'Good — multiple submarine cable connections (ACE, WACS, MainOne)',
    sezStatus: 'Moderate — Lekki Free Zone, Onne Oil & Gas FZ, Calabar FZ active',
    sezTenants: ['CNOOC', 'LG Electronics', 'Various Chinese manufacturers'],
    judicialScore: '38/100 (WJP 2024)',
    democracyIndex: '3.8 — EIU hybrid regime',
    approvalTimelines: [
      { sector: 'Technology', timeline: '~6 months', months: 6 },
      { sector: 'Financial services', timeline: '~6 months', months: 6 },
      { sector: 'Manufacturing', timeline: '~12 months', months: 12 },
      { sector: 'Oil & gas', timeline: '~18 months', months: 18 },
    ],
    majorProjects: ['Dangote Refinery full operations (2024)', 'Lekki Deep Sea Port (2023)', 'MTN Nigeria data centre expansion'],
    commonPartners: ['Ghana', 'Côte d\'Ivoire', 'Mauritius'],
    ministries: [
      {
        name: 'Nigerian Investment Promotion Commission (NIPC)',
        description: 'Investment promotion, facilitation, and aftercare',
        url: 'https://www.nipc.gov.ng',
        priority: 1,
        outreachNote: 'Tinubu-era reforms signal more openness. Frame around technology, local manufacturing, and employment creation. FX is the dominant investor concern — acknowledging reform awareness helps credibility.',
        sectors: ['tech', 'fintech', 'manufacturing', 'diversified'],
      },
      {
        name: 'Ministry of Petroleum Resources',
        description: 'Oil & gas licences, upstream and downstream regulation',
        url: 'https://www.petroleum.gov.ng',
        priority: 2,
        outreachNote: 'New PIA (Petroleum Industry Act) changed the upstream landscape. Focus on downstream, gas monetisation, and LNG for new entrants rather than upstream exploration.',
        sectors: ['extractives', 'infrastructure'],
      },
      {
        name: 'Ministry of Communications, Innovation & Digital Economy',
        description: 'Fintech, tech licences, digital infrastructure, NITDA oversight',
        url: 'https://nitda.gov.ng',
        priority: 2,
        outreachNote: 'Fintech is the flagship commercial sector. Strong appetite for data centres, cloud infrastructure, and payment systems. Lead with digital economy credentials.',
        sectors: ['tech', 'fintech'],
      },
      {
        name: 'Federal Ministry of Finance',
        description: 'Tax incentives, Pioneer Status, DFI access',
        url: 'https://www.finance.gov.ng',
        priority: 3,
        outreachNote: 'Pioneer Status gives 3–5 year tax holiday for qualifying industries. Frame around technology transfer and employment multipliers.',
        sectors: ['diversified', 'manufacturing'],
      },
    ],
    hedges: [
      { countryName: 'Ghana', iso: 'GH', type: 'Governance & stability hedge', tags: ['Democratic stability', 'English-speaking', 'Recovering economy'], reasoning: 'Ghana provides a significantly more stable operating environment for the same West Africa market reach. Standard pairing for platforms needing Nigeria\'s scale with a reliable secondary base.' },
      { countryName: 'South Africa', iso: 'ZA', type: 'Capital markets hedge', tags: ['Deep capital markets', 'Strong legal system', 'Exit liquidity'], reasoning: 'South Africa provides the financial ecosystem, legal framework, and exit liquidity that Nigeria lacks. Most serious PE Nigeria strategies maintain a Johannesburg or Cape Town presence.' },
    ],
  },
  {
    iso: 'GH', name: 'Ghana',
    educationIndex: '0.55', universities: '8+ accredited (Accra, Kumasi)',
    workforceProfile: 'Educated English-speaking workforce; particularly strong for financial services and professional sectors',
    opennessToFDI: 'Open — GIPC process relatively efficient; sector-specific minimum capital requirements apply',
    governmentPriorities: ['Mining revenue', 'Agriculture / agribusiness', 'Financial services', 'Digital economy'],
    loadshedding: true,
    loadsheddingNote: 'Intermittent load management; less severe than Nigeria or RSA; improving with new generation capacity',
    utilitiesCost: 'Medium — $0.11/kWh industrial',
    logisticsQuality: 'Moderate — Tema Port improving capacity; road network developing',
    connectivity: 'Good — ACE / SAT-3 submarine cables',
    sezStatus: 'Low-moderate — Tema Industrial Area, Appolonia Smart City corridor developing',
    sezTenants: ['Limited major anchor tenants currently'],
    judicialScore: '56/100 (WJP 2024)',
    democracyIndex: '6.4 — EIU flawed democracy',
    approvalTimelines: [
      { sector: 'Agriculture', timeline: '~4 months', months: 4 },
      { sector: 'Financial services', timeline: '~5 months', months: 5 },
      { sector: 'Manufacturing', timeline: '~6 months', months: 6 },
      { sector: 'Mining', timeline: '~10 months', months: 10 },
    ],
    majorProjects: ['Jubilee Field oil expansion', 'Cocoa processing hub investment', 'Accra digital district'],
    commonPartners: ['Nigeria', 'Côte d\'Ivoire', 'Mauritius'],
    ministries: [
      {
        name: 'Ghana Investment Promotion Centre (GIPC)',
        description: 'Primary FDI facilitation and registration',
        url: 'https://www.gipcghana.com',
        priority: 1,
        outreachNote: 'Post-debt-restructuring Ghana is actively courting FDI to support the cedi and IMF programme. Lead with employment, local content, and export potential. Avoid foregrounding capital repatriation concerns in initial discussions.',
        sectors: ['tech', 'fintech', 'manufacturing', 'diversified'],
      },
      {
        name: 'Ministry of Lands & Natural Resources',
        description: 'Mining licences, forestry, land tenure',
        url: 'https://www.mlnr.gov.gh',
        priority: 2,
        outreachNote: 'Focus on responsible extraction with local community benefits. Small-scale mining regulation is tightening; large-scale corporate investment with community programmes is welcomed.',
        sectors: ['extractives', 'agri'],
      },
      {
        name: 'Ministry of Finance',
        description: 'Tax framework, IMF programme compliance, DFI access',
        url: 'https://mofep.gov.gh',
        priority: 3,
        outreachNote: 'IMF programme constrains fiscal flexibility. Government prioritising revenue generation — frame investment around tax contribution and economic multipliers.',
        sectors: ['diversified', 'fintech'],
      },
    ],
    hedges: [
      { countryName: 'Côte d\'Ivoire', iso: 'CI', type: 'Stability & growth complement', tags: ['Faster growth', 'CFA franc stability', 'Less FX risk'], reasoning: 'Côte d\'Ivoire offers faster growth with CFA franc stability, directly hedging Ghana\'s FX and macro volatility risk. The most natural West Africa pairing for investors with Ghana exposure.' },
      { countryName: 'Nigeria', iso: 'NG', type: 'Market scale hedge', tags: ['Largest West Africa market', 'Consumer depth', 'Fintech ecosystem'], reasoning: 'For investors using Ghana as a stable regional base, Nigeria provides the market scale upside. Classic pairing for West Africa platform strategies.' },
    ],
  },
  {
    iso: 'BW', name: 'Botswana',
    educationIndex: '0.65', universities: '2 accredited (Gaborone)',
    workforceProfile: 'Small skilled pool; high cost relative to market size; strong professional services base',
    opennessToFDI: 'Very open — BITC efficient single-window process; welcoming regulatory environment',
    governmentPriorities: ['Diamond sector diversification', 'Financial services hub', 'Technology', 'Regional logistics'],
    loadshedding: false,
    loadsheddingNote: 'Historically no loadshedding; some imported power dependency from RSA during peak demand',
    utilitiesCost: 'Medium — $0.09/kWh industrial',
    logisticsQuality: 'Limited — landlocked; dependent on RSA and Namibia corridor access',
    connectivity: 'Moderate — improving national fibre backbone programme',
    sezStatus: 'Low-moderate — Gaborone SEZ under development; limited current tenants',
    sezTenants: ['Limited current tenants — zone still developing'],
    judicialScore: '74/100 (WJP 2024 — highest in Southern Africa)',
    democracyIndex: '7.0 — EIU flawed democracy',
    approvalTimelines: [
      { sector: 'Technology', timeline: '~2 months', months: 2 },
      { sector: 'Financial services', timeline: '~3 months', months: 3 },
      { sector: 'Real estate', timeline: '~4 months', months: 4 },
      { sector: 'Mining', timeline: '~6 months', months: 6 },
    ],
    majorProjects: ['De Beers Jwaneng mine life extension', 'BSE capital market expansion', 'BIUST technology park'],
    commonPartners: ['South Africa', 'Namibia', 'Zambia'],
    ministries: [
      {
        name: 'Botswana Investment & Trade Centre (BITC)',
        description: 'Investment promotion and facilitation — one-stop service',
        url: 'https://www.bitc.co.bw',
        priority: 1,
        outreachNote: 'Botswana is actively diversifying from diamonds. Frame investment around economic diversification, skills transfer, and non-mining sector development. Government is highly motivated to attract non-extractive FDI.',
        sectors: ['tech', 'fintech', 'realestate', 'diversified'],
      },
      {
        name: 'Ministry of Minerals & Energy',
        description: 'Mining licences, energy policy and regulation',
        url: 'https://www.mme.gov.bw',
        priority: 2,
        outreachNote: 'Streamlined mining licensing relative to regional peers. Focus on responsible extraction and downstream beneficiation alignment with national strategy.',
        sectors: ['extractives', 'infrastructure'],
      },
      {
        name: 'Ministry of Finance',
        description: 'Tax incentives, SEZ policy, IFSC financial services regime',
        url: 'https://www.mof.gov.bw',
        priority: 3,
        outreachNote: 'Competitive 22% corporate tax. IFSC regime for financial services offers significant advantages. Stable and highly predictable fiscal framework.',
        sectors: ['fintech', 'diversified'],
      },
    ],
    hedges: [
      { countryName: 'South Africa', iso: 'ZA', type: 'Market scale & ecosystem hedge', tags: ['Deep capital markets', 'Industrial base', 'Consumer market'], reasoning: 'Botswana\'s governance is excellent but market is tiny. RSA provides the financial ecosystem, talent depth, and consumer base Botswana cannot offer alone.' },
      { countryName: 'Namibia', iso: 'NA', type: 'Regional platform complement', tags: ['Green hydrogen', 'Atlantic access', 'Comparable governance quality'], reasoning: 'Botswana + Namibia creates a Southern Africa platform with both Atlantic (Walvis Bay) and Indian Ocean (via RSA) corridor access, with comparable governance credentials.' },
    ],
  },
  {
    iso: 'NA', name: 'Namibia',
    educationIndex: '0.62', universities: '2 accredited (Windhoek)',
    workforceProfile: 'Small English-speaking skilled workforce; growing professional services sector',
    opennessToFDI: 'Open — NIPDB process efficient; actively welcoming to FDI especially in energy',
    governmentPriorities: ['Green hydrogen (flagship)', 'Mining', 'Tourism', 'Regional logistics hub'],
    loadshedding: false,
    loadsheddingNote: 'No loadshedding historically; imports some power from RSA during peak; own generation expanding',
    utilitiesCost: 'Medium — $0.11/kWh industrial',
    logisticsQuality: 'Good — Walvis Bay port provides Atlantic corridor access for all SADC',
    connectivity: 'Moderate — improving with new submarine cable connections planned',
    sezStatus: 'Low-moderate — Walvis Bay EPZ, Offshore Development Company zones active',
    sezTenants: ['Growing with green hydrogen and oil & gas investor interest'],
    judicialScore: '65/100 (WJP 2024)',
    democracyIndex: '6.7 — EIU flawed democracy',
    approvalTimelines: [
      { sector: 'Technology', timeline: '~3 months', months: 3 },
      { sector: 'Real estate', timeline: '~5 months', months: 5 },
      { sector: 'Energy', timeline: '~7 months', months: 7 },
      { sector: 'Mining', timeline: '~9 months', months: 9 },
    ],
    majorProjects: ['Hyphen Hydrogen Energy $10bn green H2 project', 'TotalEnergies Orange Basin oil discovery', 'Walvis Bay port expansion phase 2'],
    commonPartners: ['Botswana', 'South Africa', 'Angola'],
    ministries: [
      {
        name: 'Namibia Investment Promotion & Development Board (NIPDB)',
        description: 'Investment promotion, facilitation, and aftercare',
        url: 'https://nipdb.com',
        priority: 1,
        outreachNote: 'Green hydrogen is the national flagship — any energy investment must reference the Namibia Green Hydrogen National Programme. Strong appetite for renewables and upstream oil & gas from TotalEnergies Orange Basin discovery.',
        sectors: ['infrastructure', 'extractives', 'diversified'],
      },
      {
        name: 'Ministry of Mines & Energy',
        description: 'Mining and energy licences — exploration and production rights',
        url: 'https://www.mme.gov.na',
        priority: 2,
        outreachNote: 'Straightforward licensing relative to regional peers. New oil discoveries creating significant international investor interest — move quickly given pipeline competition.',
        sectors: ['extractives', 'infrastructure'],
      },
      {
        name: 'Ministry of Finance & Public Enterprises',
        description: 'Tax framework, incentives, SOE partnership structures',
        url: 'https://mof.gov.na',
        priority: 3,
        outreachNote: 'Competitive tax framework. EPZCO regime for export processing. Open to PPP structures for infrastructure and green energy. Walvis Bay makes Namibia a compelling logistics hub.',
        sectors: ['realestate', 'infrastructure', 'diversified'],
      },
    ],
    hedges: [
      { countryName: 'South Africa', iso: 'ZA', type: 'Market & ecosystem hedge', tags: ['Capital markets', 'Industrial base', 'Consumer depth'], reasoning: 'Namibia\'s governance and energy credentials are strong but market is tiny. RSA provides the financial ecosystem, talent, and consumer base for a combined Southern Africa platform.' },
      { countryName: 'Botswana', iso: 'BW', type: 'Governance quality peer', tags: ['Rule of law', 'Low corruption', 'Diamond economy diversifying'], reasoning: 'Botswana and Namibia form a natural Southern Africa governance pairing with complementary corridor access — Indian Ocean (via RSA) + Atlantic (Walvis Bay).' },
    ],
  },
];

// Helper to look up by ISO code
export function getIntelligence(iso: string): CountryIntelligence | undefined {
  return COUNTRY_INTELLIGENCE.find(c => c.iso === iso);
}

// Filter ministries by sector
export function getRelevantMinistries(iso: string, sector: string): Ministry[] {
  const intel = getIntelligence(iso);
  if (!intel) return [];
  return intel.ministries.filter(m =>
    m.sectors.includes(sector) || m.sectors.includes('diversified') || m.priority === 1
  ).sort((a, b) => a.priority - b.priority);
}
