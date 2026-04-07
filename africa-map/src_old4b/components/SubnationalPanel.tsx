import { useState } from 'react';
import { REGION_DATA, type RegionData } from '../data/regionData';
import type { InvestorProfile } from '../types';

interface Props {
  countryName: string;
  profile: InvestorProfile;
}

const REGION_PILLARS = [
  { id: 'score_infra',      label: 'Infrastructure',     color: '#5aabb5' },
  { id: 'score_governance', label: 'Governance',          color: '#6b9e6f' },
  { id: 'score_political',  label: 'Political Stability', color: '#4f86c6' },
  { id: 'score_labor',      label: 'Labor & Skills',      color: '#9b6db5' },
  { id: 'score_market',     label: 'Market Access',       color: '#c4a94b' },
  { id: 'score_reform',     label: 'Reform Momentum',     color: '#4caf82' },
  { id: 'score_bizenv',     label: 'Business Env.',       color: '#c46b7a' },
  { id: 'score_land',       label: 'Land Availability',   color: '#c4885a' },
];

function regionScore(r: RegionData, profile: InvestorProfile): number {
  const w = profile.weights;
  const score =
    (r.score_political  * (w.political / 100)) +
    (r.score_governance * (w.ruleOfLaw / 100)) +
    (r.score_infra      * (w.infrastructure / 100)) +
    (r.score_market     * (w.marketDepth / 100)) +
    (r.score_reform     * (w.growth / 100));
  const usedWeight = (w.political + w.ruleOfLaw + w.infrastructure + w.marketDepth + w.growth) / 100;
  return Math.round(score / Math.max(usedWeight, 0.1));
}

export default function SubnationalPanel({ countryName, profile }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const regions = REGION_DATA.filter(r => r.country === countryName);

  if (regions.length === 0) {
    return (
      <div style={{ background: '#0d1117', border: '1px solid #2a3245', borderRadius: 8, padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>
          Subnational data not yet available for {countryName}. Regional data will be added progressively.
        </div>
      </div>
    );
  }

  const scored = regions
    .map(r => ({ ...r, customScore: regionScore(r, profile) }))
    .sort((a, b) => b.customScore - a.customScore);

  const displayed = showAll ? scored : scored.slice(0, 2);

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {regions.length} regions · ranked by your profile
        </div>
        {scored.length > 2 && (
          <button onClick={() => setShowAll(s => !s)} style={{ background: 'none', border: 'none', color: '#3d7be8', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {showAll ? 'Show top 2 only ▲' : `Show all ${regions.length} ▼`}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayed.map((r, i) => {
          const isBest = i === 0;
          const isExpanded = expandedRegion === r.name;
          return (
            <div key={r.name} style={{
              background: '#0d1117',
              border: `1px solid ${isBest && !showAll ? '#3d7be840' : '#1e2535'}`,
              borderRadius: 8, padding: '0.6rem 0.8rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  minWidth: 28, height: 28, borderRadius: 5, background: '#161c27',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: '#7db4f0',
                }}>{i + 1}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#c4cdd8', fontSize: '0.9rem' }}>{r.name}</span>
                    {isBest && !showAll && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#0d2a1a', color: '#4caf82', fontWeight: 600 }}>Best fit</span>}
                    {r.sezPresent === 'Yes' && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#1a2e50', color: '#7db4f0' }}>SEZ</span>}
                  </div>
                  {r.majorIndustries && <div style={{ fontSize: '0.72rem', color: '#4a5568', marginTop: 1 }}>{r.majorIndustries}</div>}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8ecf0', lineHeight: 1 }}>{r.customScore}</div>
                  <div style={{ fontSize: '0.65rem', color: '#4a5568' }}>/100</div>
                </div>

                <button onClick={() => setExpandedRegion(isExpanded ? null : r.name)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem' }}>
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>

              {/* Mini pillar bars */}
              <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.2rem', alignItems: 'flex-end', height: 18 }}>
                {REGION_PILLARS.map(pd => {
                  const score = r[pd.id as keyof RegionData] as number;
                  return <div key={pd.id} title={`${pd.label}: ${score}/100`} style={{ flex: 1, height: `${Math.max(2, Math.round(score * 0.18))}px`, background: pd.color, borderRadius: 1, opacity: 0.75, alignSelf: 'flex-end' }} />;
                })}
              </div>

              {isExpanded && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1e2535', paddingTop: '0.75rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    {REGION_PILLARS.map(pd => {
                      const score = r[pd.id as keyof RegionData] as number;
                      return (
                        <div key={pd.id} style={{ marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{pd.label}</span>
                            <span style={{ fontSize: '0.75rem', color: pd.color, fontWeight: 600 }}>{score}/100</span>
                          </div>
                          <div style={{ height: 3, background: '#161c27', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${score}%`, background: pd.color, borderRadius: 2, opacity: 0.8 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    {[
                      ['SEZ', r.sezName || 'None'],
                      ['Key investors', r.keyForeignInvestors],
                      ['Labor cost', r.laborCostLevel],
                      ['Land cost', r.industrialLandCost],
                      ['Electricity cost', r.electricityCost],
                      ['Distance to port', r.distanceToPort],
                      ['Export orientation', r.exportOrientation],
                      ['Industry clusters', r.industryClusters],
                      ['Multinationals', r.multinationalPresence],
                      ['Tax admin', r.taxAdminComplexity],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string} style={{ background: '#161c27', borderRadius: 5, padding: '0.4rem 0.6rem' }}>
                        <div style={{ fontSize: '0.65rem', color: '#4a5568', marginBottom: '0.1rem' }}>{label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#c4cdd8' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {r.strategicImportance && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                      Strategic note: {r.strategicImportance}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
