// Evidence database — real citations from scanned literature
// Sources: APSR, AJPS, African Affairs, Journal of Modern African Studies,
// World Economy, Journal of Benefit-Cost Analysis, Global Studies Quarterly,
// Journal of African Trade, UNCTAD, World Bank WGI, V-Dem, IMF, MIGA

export interface Citation {
  authors: string;
  year: number;
  title: string;
  journal: string;
  finding: string;
  url?: string;
}

export interface PillarEvidence {
  pillarId: string;
  summary: string;
  keyInsight: string;
  confidence: 'strong' | 'moderate' | 'mixed';
  dataSource: string;
  citations: Citation[];
  yourDataNote: string;
}

export const EVIDENCE: PillarEvidence[] = [
  {
    pillarId: 'political',
    summary: 'Political stability affects FDI in Africa unevenly — its importance depends critically on whether a country is resource-intensive.',
    keyInsight: 'Non-resource-intensive African countries are vulnerable to both macroeconomic AND political uncertainty, while FDI into oil-exporting and resource-rich countries is mainly sensitive to macro uncertainty only. This means political stability is a stronger differentiator for manufacturing, services, and diversified investment than for extractive FDI.',
    confidence: 'strong',
    dataSource: 'V-Dem Polyarchy index; World Bank Political Stability & Absence of Violence indicator; Insurgency coding from ACLED/WorldFactbook',
    citations: [
      {
        authors: 'Ackah-Baidoo et al.',
        year: 2024,
        title: 'Investment Uncertainties and Economic Growth in Sub-Saharan Africa',
        journal: 'Global Studies Quarterly (Oxford Academic)',
        finding: 'FDI in oil-exporting and resource-intensive SSA countries was only sensitive to macroeconomic uncertainty; FDI in non-resource-intensive countries was vulnerable to both macroeconomic and political uncertainties across 31 SSA countries, 1996–2018.',
      },
      {
        authors: 'Asongu & Nwachukwu',
        year: 2022,
        title: 'Global uncertainty, economic governance institutions and foreign direct investment inflow in Africa',
        journal: 'Journal of Economic Studies (PMC)',
        finding: 'Global uncertainty has a significant dampening effect on FDI inflow to Africa; economic governance institutions amplify rather than mitigate this effect.',
      },
      {
        authors: 'MIGA',
        year: 2024,
        title: 'Shifting Shores: FDI Relocations and Political Risk',
        journal: 'MIGA World Bank Group',
        finding: 'Fragile and conflict-affected states saw diverging FDI trends 2019–2023; political risk remains a top investor concern in frontier African markets.',
      },
      {
        authors: 'Chatham House',
        year: 2026,
        title: 'Africa in 2026: Global uncertainty demands regional leadership',
        journal: 'Chatham House',
        finding: 'Active instability hotspots identified in eastern DRC, Sahel, Horn of Africa, and northern Mozambique; youth-led political mobilisation reshaping governance in Kenya, Morocco, Tanzania, and Togo.',
      },
      {
        authors: 'Coppedge et al.',
        year: 2024,
        title: 'V-Dem Dataset v14',
        journal: 'Varieties of Democracy (V-Dem) Institute',
        finding: 'Electoral democracy (polyarchy) scores used as continuous measure of democratic governance quality.',
      },
    ],
    yourDataNote: 'Scored from: World Bank Political Stability indicator (compact text), V-Dem polyarchy %, insurgency classification from ACLED/WorldFactbook.',
  },

  {
    pillarId: 'ruleOfLaw',
    summary: 'Rule of law, contract enforcement, and corruption consistently emerge as the most robust institutional determinants of FDI in Africa — sometimes stronger than natural resource endowments.',
    keyInsight: 'Asiedu (2006) found that reducing corruption from Nigeria\'s level to South Africa\'s has the same positive FDI effect as increasing fuels/minerals in exports by ~35%. Recent threshold analysis (2024) confirms corruption-FDI relationship is non-linear in Africa: below a governance threshold, corruption deters investment; above it, "helping hand" effects may emerge. Land tenure insecurity deters property investment, limits collateralisation, and constrains revenue.',
    confidence: 'strong',
    dataSource: 'Transparency International CPI 2024; World Bank Control of Corruption; Freedom House Civil Liberties; Numbeo Crime Index 2026; contract enforcement from World Bank Doing Business legacy data',
    citations: [
      {
        authors: 'Asiedu, E.',
        year: 2006,
        title: 'Foreign Direct Investment in Africa: The Role of Natural Resources, Market Size, Government Policy, Institutions and Political Instability',
        journal: 'The World Economy (Wiley)',
        finding: 'Rule of law, lower corruption, and reliable legal system attract FDI comparably to natural resources. Reducing corruption from Nigeria to South Africa level equals a 35% increase in mineral export share in terms of FDI effect.',
      },
      {
        authors: 'Knutsen, C.H., Kotsadam, A., Olsen, E.H. & Wig, T.',
        year: 2017,
        title: 'Mining and Local Corruption in Africa',
        journal: 'American Journal of Political Science (AJPS)',
        finding: 'Mining activity significantly increases local-level corruption in 19 African countries, using geocoded firm-level and household data. FDI presence does not automatically reduce corruption.',
      },
      {
        authors: 'Gossel, S.',
        year: 2025,
        title: 'The Relationship Between Corruption and FDI in Sub-Saharan Africa',
        journal: 'Palgrave Handbook of African Politics, Governance and Development',
        finding: 'Corruption in SSA evolved through post-independence patron-client structures. Higher corruption destinations attract less FDI overall, but more from high-corruption origin countries.',
      },
      {
        authors: 'Tankari & Diallo',
        year: 2024,
        title: 'Governance and the relationship between corruption and FDI in Africa: a threshold regression analysis',
        journal: 'International Review of Applied Economics (Taylor & Francis)',
        finding: 'Dynamic panel threshold model across 34 African countries 2005–2019 confirms non-linear corruption–FDI relationship; institutional threshold separates "grabbing hand" and "helping hand" regimes.',
      },
      {
        authors: 'Byamugisha, F.F.K. et al.',
        year: 2023,
        title: 'The Investment Case for Land Tenure Security in Sub-Saharan Africa: A Cost–Benefit Analysis',
        journal: 'Journal of Benefit-Cost Analysis (Cambridge)',
        finding: 'Very large estimated gains from improving land tenure security across SSA: higher agricultural output, urban property values, and investor confidence. Digitisation of land registries in Rwanda, Uganda, Mauritius, and South Africa cited as models.',
      },
      {
        authors: 'Boone, C.',
        year: 2019,
        title: 'Legal empowerment of the poor through property rights reform',
        journal: 'Journal of Development Studies',
        finding: 'Tensions and trade-offs of land registration and titling in sub-Saharan Africa; formal titles improve collateralisation but context-specific implementation matters.',
      },
      {
        authors: 'Kaufmann, D., Kraay, A. & Mastruzzi, M.',
        year: 2024,
        title: 'Worldwide Governance Indicators',
        journal: 'World Bank',
        finding: 'Composite governance scores used globally as standard measures of rule of law, government effectiveness, regulatory quality, and control of corruption.',
      },
    ],
    yourDataNote: 'Scored from: contract enforcement text (World Bank legacy Doing Business), corruption text (TI CPI-derived), human rights (Freedom House), crime composite (Numbeo 2026), land ownership classification.',
  },

  {
    pillarId: 'fx',
    summary: 'FX convertibility and capital repatriation are core investor requirements — now scored for all 54 countries.',
    keyInsight: 'CFA franc zone countries (UEMOA and CEMAC) benefit from freely convertible currencies pegged to the euro, giving them a structural advantage for investors requiring capital repatriation. Countries with highly restricted FX (Algeria, Eritrea, Zimbabwe, Sudan, Libya, DR Congo, Burundi) present the highest repatriation risk. Recent IMF analysis highlights that policy uncertainty around capital flows amplifies FDI losses. Nigeria, Egypt, and Ethiopia have undergone significant FX reforms since 2023, improving convertibility but with residual risk.',
    confidence: 'moderate',
    dataSource: 'IMF Annual Report on Exchange Arrangements and Exchange Restrictions (AREAER) 2024; World Bank; central bank publications; AfDB',
    citations: [
      {
        authors: 'UNCTAD',
        year: 2024,
        title: 'World Investment Report 2024',
        journal: 'United Nations Conference on Trade and Development',
        finding: 'Africa had an FDI stock of ~42% of GDP in 2023, well below South America (74%), partly reflecting persistent repatriation friction and FX restrictions in key markets.',
      },
      {
        authors: 'IMF',
        year: 2023,
        title: 'World Economic Outlook: Geoeconomic Fragmentation and Foreign Direct Investment',
        journal: 'IMF World Economic Outlook (April 2023), Chapter 4',
        finding: 'Policy uncertainty amplifies FDI losses for non-aligned economies; FX and capital flow restrictions increase vulnerability to fragmentation-driven investment reallocation.',
      },
      {
        authors: 'ISS Africa Futures',
        year: 2026,
        title: 'Africa Financial Flows Forecast',
        journal: 'Institute for Security Studies, African Futures',
        finding: 'FDI flows to Africa depend on FX availability, capital repatriation frameworks, and currency stability alongside institutional and market factors.',
      },
    ],
    yourDataNote: 'Scored from: IMF AREAER classifications mapped to 0–100 scale. Freely convertible = 88, Largely convertible = 75, Partially restricted = 45–58, Highly restricted = 15. CFA franc zone countries score highly due to euro peg and free capital movement within the zone.',
  },

  {
    pillarId: 'macro',
    summary: 'Macroeconomic stability — inflation, debt, and growth — is now scored for all 54 countries.',
    keyInsight: 'Asiedu (2006) found lower inflation significantly raises FDI in Africa. The current macro landscape is polarised: CFA franc zone countries have low inflation (~3–5%) due to the euro peg, while several non-CFA countries face severe macro stress — Sierra Leone (52%), South Sudan (85%), Sudan (62%). High debt burdens (Eritrea 185%, Sudan 212%, Zambia 128%) signal sovereign risk. Growth leaders include Niger (11%), Ivory Coast (6.8%), Rwanda (7.8%), and Senegal (8.2%), while resource-dependent Equatorial Guinea (-3.5%) and low-reform South Africa (1.1%) lag.',
    confidence: 'moderate',
    dataSource: 'IMF World Economic Outlook (2024); World Bank World Development Indicators; AfDB African Economic Outlook 2024',
    citations: [
      {
        authors: 'Asiedu, E.',
        year: 2006,
        title: 'Foreign Direct Investment in Africa',
        journal: 'The World Economy',
        finding: 'Lower inflation has a significant positive effect on FDI inflows in Africa, alongside institutional quality and infrastructure.',
      },
      {
        authors: 'Sare et al.',
        year: 2023,
        title: 'Environmental risk and growth in foreign direct investment: Is the composition of FDI in Sub-Saharan Africa speculative?',
        journal: 'Cogent Economics & Finance (Taylor & Francis)',
        finding: 'GDP growth uncertainty and inflation volatility attract speculative FDI in SSA — but governance quality moderates this effect.',
      },
      {
        authors: 'IMF',
        year: 2024,
        title: 'World Economic Outlook',
        journal: 'International Monetary Fund',
        finding: 'Sub-Saharan Africa growth at 3.8% in 2024; inflation declining but fiscal pressures remain elevated in high-debt countries.',
      },
    ],
    yourDataNote: 'Scored from: Inflation rate (45% weight), government debt/GDP (35%), GDP growth rate (20%). Data approximate for 2024 from IMF/World Bank. CFA franc zone countries benefit from structurally low inflation.',
  },

  {
    pillarId: 'marketDepth',
    summary: 'Market depth and exitability — now scored for all 54 countries using stock exchange quality and ease of doing business.',
    keyInsight: 'Africa\'s capital markets are heavily concentrated: JSE (South Africa), Egyptian Exchange, and Casablanca Stock Exchange account for the majority of continental market capitalisation. The BRVM serves 8 WAEMU countries from Abidjan and is the most accessible regional exchange for West Africa. Rwanda, Mauritius, and Morocco are the top-ranked ease-of-doing-business performers. Ethiopia\'s ESX launched in 2024. Private equity exit routes remain thin outside South Africa, Nigeria, Kenya, and Egypt.',
    confidence: 'moderate',
    dataSource: 'World Federation of Exchanges; World Bank Doing Business legacy data; AfDB; national stock exchange publications',
    citations: [
      {
        authors: 'Njuguna, A.E. & Nnadozie, E.',
        year: 2022,
        title: 'Investment Climate and Foreign Direct Investment in Africa: The Role of Ease of Doing Business',
        journal: 'Journal of African Trade (Springer)',
        finding: 'Ease of doing business plays a positive and significant role in attracting FDI to Africa even after controlling for natural resources and market size.',
      },
      {
        authors: 'Asongu et al.',
        year: 2020,
        title: 'The role of FDI, financial development, democracy and political instability on economic growth in West Africa',
        journal: 'International Journal of Managerial Finance',
        finding: 'Financial development follows supply-leading hypothesis in West Africa. Financial sector depth crucial for sustainable development and FDI attractiveness.',
      },
      {
        authors: 'ISS Africa Futures',
        year: 2026,
        title: 'Africa Financial Flows Forecast',
        journal: 'Institute for Security Studies, African Futures',
        finding: 'Africa\'s FDI stock at ~42% of GDP vs South America 74%. Thin exit markets outside the largest economies remain a structural barrier to PE and institutional investment.',
      },
    ],
    yourDataNote: 'Scored from: Stock exchange quality and ease of doing business tier. JSE=88, EGX=78, CSE=75, SEM=72, NGX=65, NSE=62, BRVM=55, No exchange=10–20.',
  },

  {
    pillarId: 'infrastructure',
    summary: 'Infrastructure quality is one of the most consistently significant and causal determinants of FDI in Africa, with electricity and roads showing the strongest effects.',
    keyInsight: 'Infrastructure — especially power reliability and port efficiency — is a foundational FDI attractor in SSA. The AfDB estimates Africa\'s annual infrastructure gap at $130–170bn. DFI investments in infrastructure, agribusiness, and finance significantly affect FDI flows, with infrastructure having the greatest impact. Subnational variation in infrastructure quality meaningfully shapes where within a country foreign investment locates.',
    confidence: 'moderate',
    dataSource: 'Subnational data: infrastructure quality, power reliability, port efficiency (from your dataset); national-level proxies from AfDB African Infrastructure Development Index',
    citations: [
      {
        authors: 'Cagiza et al.',
        year: 2025,
        title: 'FDI, Development Finance Institutions, and Economic Growth in Sub-Saharan Africa',
        journal: 'Journal of Economics, Finance and International Business (AERC)',
        finding: 'DFI investments in infrastructure, agribusiness, and finance significantly affect FDI flows in SSA, with infrastructure having the greatest impact due to its foundational role.',
      },
      {
        authors: 'Asiedu, E.',
        year: 2006,
        title: 'Foreign Direct Investment in Africa',
        journal: 'The World Economy',
        finding: 'Better infrastructure (roads, electricity, communications) has a significant positive effect on FDI in Africa, comparable to institutional quality variables.',
      },
      {
        authors: 'ISS Africa Futures / AfDB',
        year: 2025,
        title: 'Advancing Inclusive Development: Policy options for Burkina Faso, Guinea, Gabon, Mali and Niger',
        journal: 'ISS African Futures',
        finding: 'Guinea ranked 33rd/54 African countries on African Infrastructure Development Index in 2024; only 8% of roads paved. Infrastructure deficits consistently cited as primary barrier to FDI and growth across Sahel and West Africa.',
      },
      {
        authors: 'Lawry, McLain, Rugadya et al.',
        year: 2023,
        title: 'Land Tenure Reform in Sub-Saharan Africa: Interventions in Benin, Ethiopia, Rwanda, and Zimbabwe',
        journal: 'Routledge',
        finding: 'Land tenure clarity and digitisation of land registries (Rwanda, Uganda, Mauritius, South Africa) reduce transaction costs and attract investment. Subnational variation in land tenure regimes shapes locational choices.',
      },
    ],
    yourDataNote: 'Scored from: subnational infrastructure quality, power reliability, and port efficiency (averaged per country where available). 34 of 54 countries have subnational data.',
  },

  {
    pillarId: 'growth',
    summary: 'Population growth, market size, and demographic dividend potential are strong long-run growth attractors for Africa-focused investors.',
    keyInsight: 'Africa\'s population growth rate of 2.5% per year — more than double the global average — creates both opportunity and risk. Large and growing markets attract FDI even in weaker institutional environments. However, the youth bulge also creates governance and stability pressures if economic opportunity does not keep pace. UNCTAD (2024) confirms natural resources and large markets remain the most robust FDI attractors in Africa.',
    confidence: 'moderate',
    dataSource: 'Population and 10yr growth from WorldFactbook/UN Population Division; economic community membership',
    citations: [
      {
        authors: 'UNCTAD',
        year: 2024,
        title: 'World Investment Report 2024',
        journal: 'United Nations Conference on Trade and Development',
        finding: 'Natural resources and large markets remain the most robust predictors of FDI inflows to Africa. Record inward FDI to Africa in 2024, though announced greenfield project values fell sharply — highlighting gap between raw flows and strategy-fit opportunity.',
      },
      {
        authors: 'Asiedu, E.',
        year: 2006,
        title: 'Foreign Direct Investment in Africa',
        journal: 'The World Economy',
        finding: 'Market size and natural resources promote FDI; small countries lacking resources can still attract FDI by improving institutions and policy environment.',
      },
      {
        authors: 'ISS Africa Futures',
        year: 2026,
        title: 'Africa Financial Flows Forecast',
        journal: 'ISS / African Futures',
        finding: 'Africa\'s population grows at 2.5% per year — over double the global average. Youth bulge at ~49% in West Africa creates both demographic dividend potential and governance risk if job creation lags.',
      },
      {
        authors: 'Mapping FDI Research in Africa (Bibliometric Review)',
        year: 2025,
        title: 'Mapping Foreign Direct Investment Research in Africa: 1986–2024',
        journal: 'Economies (MDPI)',
        finding: 'Subnational FDI dynamics and digital transformation identified as key underexplored themes; geographic granularity within Africa is an important gap in the existing literature.',
      },
    ],
    yourDataNote: 'Scored from: 2024 population (WorldFactbook), 10-year population growth %. Market size proxy only — GDP per capita and sector growth data will improve this pillar when added.',
  },
];
