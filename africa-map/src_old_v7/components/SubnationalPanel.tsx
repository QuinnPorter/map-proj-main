import { useState, useMemo } from 'react';
import type { PillarWeights } from '../types';
import { getRegionsForCountry, REGION_SCORE_LABELS, type ScoredRegion } from '../scoring/regionScoring';

interface Props {
  countryName: string;
  weights: PillarWeights;
}

const SCORE_COLOR = (s: number) => {
  if (s >= 70) return '#2e7d52';
  if (s >= 50) return '#b07d1a';
  if (s >= 30) return '#c05020';
  return '#c0392b';
};

const SCORE_BG = (s: number) => {
  if (s >= 70) return '#f0faf5';
  if (s >= 50) return '#fef9ec';
  if (s >= 30) return '#fff4ec';
  return '#fdf0f0';
};

export default function SubnationalPanel({ countryName, weights }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const regions = useMemo(() => getRegionsForCountry(countryName, weights), [countryName, weights]);

  if (regions.length === 0) {
    return (
      <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid #e2e6ea' }}>
        <div style={{ fontSize: '0.75rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Subnational regions
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8a9ab0' }}>
          Subnational data not yet available for {countryName}. Coming soon.
        </div>
      </div>
    );
  }

  const topRegions = regions.slice(0, 2);
  const remainingRegions = regions.slice(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Subnational regions
          </div>
          <div style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.1rem' }}>
            {regions.length} regions ranked by your investor profile
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#3d7be8', fontWeight: 600 }}>★ Best fit for your profile</div>

      {topRegions.map(r => (
        <RegionCard key={r.name} region={r} isExpanded={expandedRegion === r.name}
          onToggle={() => setExpandedRegion(expandedRegion === r.name ? null : r.name)} highlight />
      ))}

      {remainingRegions.length > 0 && (
        <>
          <button onClick={() => setShowAll(v => !v)} style={{
            background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 6,
            color: '#6b7280', fontSize: '0.76rem', padding: '0.4rem 0.8rem',
            cursor: 'pointer', fontFamily: 'inherit', width: '100%',
          }}>
            {showAll ? '▲ Hide all regions' : `▼ Show all ${regions.length} regions`}
          </button>
          {showAll && remainingRegions.map(r => (
            <RegionCard key={r.name} region={r} isExpanded={expandedRegion === r.name}
              onToggle={() => setExpandedRegion(expandedRegion === r.name ? null : r.name)} highlight={false} />
          ))}
        </>
      )}
    </div>
  );
}

function RegionCard({ region, isExpanded, onToggle, highlight }: {
  region: ScoredRegion; isExpanded: boolean; onToggle: () => void; highlight: boolean;
}) {
  const validScores = REGION_SCORE_LABELS.filter(l => region.scores[l.key] >= 0);
  const topStrengths = [...validScores].sort((a, b) => (region.scores[b.key] as number) - (region.scores[a.key] as number)).slice(0, 3);
  const topWeaknesses = [...validScores].sort((a, b) => (region.scores[a.key] as number) - (region.scores[b.key] as number)).slice(0, 2);

  return (
    <div style={{
      background: highlight ? SCORE_BG(region.profileScore) : '#f8f9fb',
      border: `1px solid ${highlight ? '#e2e6ea' : '#e2e6ea'}`,
      borderRadius: 8, padding: '0.7rem 0.85rem',
      boxShadow: highlight ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          minWidth: 26, height: 26, borderRadius: 5, background: '#fff',
          border: '1px solid #e2e6ea', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#3d7be8',
        }}>{region.rank}</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.88rem' }}>{region.name}</span>
            {region.sezPresent === 'Yes' && (
              <span style={{ fontSize: '0.62rem', padding: '0.08rem 0.3rem', background: '#e8f5e9', border: '1px solid #b8e0cc', borderRadius: 3, color: '#2e7d52', fontWeight: 600 }}>SEZ</span>
            )}
          </div>
          {region.majorIndustries && region.majorIndustries !== 'Information unavailable' && (
            <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: 1 }}>
              {region.majorIndustries.substring(0, 55)}{region.majorIndustries.length > 55 ? '…' : ''}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', minWidth: 42 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: SCORE_COLOR(region.profileScore), lineHeight: 1 }}>{region.profileScore}</div>
          <div style={{ fontSize: '0.6rem', color: '#8a9ab0' }}>/100</div>
        </div>

        <button onClick={onToggle} style={{ background: 'none', border: 'none', color: '#8a9ab0', cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem' }}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Mini bars */}
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.2rem', height: 16, alignItems: 'flex-end' }}>
        {REGION_SCORE_LABELS.slice(0, 8).map(l => {
          const s = region.scores[l.key];
          if (s < 0) return <div key={l.key} style={{ flex: 1, height: 2, background: '#e2e6ea', borderRadius: 1 }} />;
          return <div key={l.key} title={`${l.label}: ${s}/100`} style={{ flex: 1, height: `${Math.max(2, Math.round(s * 0.15))}px`, background: SCORE_COLOR(s), borderRadius: 1, opacity: 0.75, alignSelf: 'flex-end' }} />;
        })}
      </div>

      {isExpanded && (
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e6ea', paddingTop: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#2e7d52', fontWeight: 600, marginBottom: '0.3rem' }}>Top strengths</div>
              {topStrengths.map(l => (
                <div key={l.key} style={{ fontSize: '0.72rem', color: '#1a2035', marginBottom: '0.18rem' }}>
                  · {l.label}: <span style={{ color: SCORE_COLOR(region.scores[l.key] as number), fontWeight: 600 }}>{region.scores[l.key]}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#c05020', fontWeight: 600, marginBottom: '0.3rem' }}>Main constraints</div>
              {topWeaknesses.map(l => (
                <div key={l.key} style={{ fontSize: '0.72rem', color: '#1a2035', marginBottom: '0.18rem' }}>
                  · {l.label}: <span style={{ color: SCORE_COLOR(region.scores[l.key] as number), fontWeight: 600 }}>{region.scores[l.key]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.6rem' }}>
            {REGION_SCORE_LABELS.map(l => {
              const s = region.scores[l.key];
              return (
                <div key={l.key} style={{ background: '#fff', borderRadius: 4, padding: '0.32rem 0.5rem', border: '1px solid #e2e6ea' }}>
                  <div style={{ fontSize: '0.65rem', color: '#8a9ab0', marginBottom: '0.1rem' }}>{l.label}</div>
                  {s < 0 ? (
                    <div style={{ fontSize: '0.7rem', color: '#c0c8d4' }}>—</div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ flex: 1, height: 3, background: '#e2e6ea', borderRadius: 1 }}>
                        <div style={{ height: '100%', width: `${s}%`, background: SCORE_COLOR(s), borderRadius: 1 }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: SCORE_COLOR(s), minWidth: 22 }}>{s}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {[
              ['SEZ', region.sezPresent === 'Yes' ? (region.sezName || 'Present') : 'None'],
              ['Key investors', region.keyForeignInvestors],
              ['Electricity cost', region.electricityCost],
              ['Distance to port', region.distanceToPort],
              ['Industrial land', region.industrialLandCost],
              ['Export orientation', region.exportOrientation],
            ].filter(([, v]) => v && v !== 'Information unavailable' && v !== '').map(([label, value]) => (
              <div key={label} style={{ background: '#fff', borderRadius: 4, padding: '0.32rem 0.5rem', border: '1px solid #e2e6ea' }}>
                <div style={{ fontSize: '0.65rem', color: '#8a9ab0', marginBottom: '0.1rem' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#1a2035' }}>{String(value).substring(0, 50)}{String(value).length > 50 ? '…' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
