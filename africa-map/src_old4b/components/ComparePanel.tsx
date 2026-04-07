import type { CountryResult } from '../types';
import { PILLARS } from '../scoring/engine';

interface Props {
  countries: CountryResult[];
  selected: string[];
  onToggle: (name: string) => void;
  onClose: () => void;
}

export default function ComparePanel({ countries, selected, onToggle, onClose }: Props) {
  const compared = countries.filter(c => selected.includes(c.name));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid #2a3245',
        borderRadius: 12, width: '100%', maxWidth: 820,
        maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e8ecf0' }}>
            Country comparison
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: '1.2rem',
          }}>✕</button>
        </div>

        {compared.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Select up to 3 countries from the results list to compare them here.
          </p>
        )}

        {compared.length > 0 && (
          <>
            {/* Score header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `140px repeat(${compared.length}, 1fr)`,
              gap: '0.5rem', marginBottom: '1rem',
            }}>
              <div />
              {compared.map(c => (
                <div key={c.name} style={{
                  background: '#161c27', borderRadius: 8, padding: '0.75rem',
                  textAlign: 'center', position: 'relative',
                }}>
                  <button
                    onClick={() => onToggle(c.name)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'none', border: 'none', color: '#4a5568',
                      cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1,
                    }}
                  >✕</button>
                  <div style={{ fontWeight: 700, color: '#e8ecf0', fontSize: '1rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.4rem' }}>{c.economicCommunity}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3d7be8' }}>{c.customScore}</div>
                  <div style={{ fontSize: '0.7rem', color: '#4a5568' }}>custom score</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                    Rank #{c.customRank}
                    {c.rankChange !== 0 && (
                      <span style={{ color: c.rankChange > 0 ? '#4caf82' : '#f0a050', marginLeft: '0.3rem' }}>
                        {c.rankChange > 0 ? `▲${c.rankChange}` : `▼${Math.abs(c.rankChange)}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pillar breakdown */}
            {PILLARS.map(pd => (
              <div key={pd.id} style={{
                display: 'grid',
                gridTemplateColumns: `140px repeat(${compared.length}, 1fr)`,
                gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#a0aec0' }}>{pd.shortName}</div>
                {compared.map(c => {
                  const p = c.pillars.find(x => x.id === pd.id);
                  const isPending = !p || p.score < 0;
                  const score = isPending ? null : p!.score;

                  // Find max score for this pillar across compared
                  const scores = compared
                    .map(cc => cc.pillars.find(x => x.id === pd.id)?.score ?? -1)
                    .filter(s => s >= 0);
                  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
                  const isTop = score !== null && score === maxScore && scores.length > 1;

                  return (
                    <div key={c.name} style={{
                      background: '#161c27', borderRadius: 6, padding: '0.5rem 0.75rem',
                      border: isTop ? `1px solid ${pd.color}40` : '1px solid transparent',
                    }}>
                      {isPending ? (
                        <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>pending</div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isTop ? pd.color : '#c4cdd8' }}>
                              {score}/100
                            </span>
                            {isTop && <span style={{ fontSize: '0.65rem', color: pd.color }}>best</span>}
                          </div>
                          <div style={{ height: 3, background: '#1e2535', borderRadius: 2 }}>
                            <div style={{
                              height: '100%', width: `${score}%`,
                              background: pd.color, borderRadius: 2, opacity: 0.8,
                            }} />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Key facts comparison */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #2a3245', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key facts
              </div>
              {[
                { label: 'Population', key: 'population' as const },
                { label: 'Corporate tax', key: 'corporateTax' as const },
                { label: 'Political stability', key: 'politicalStabilityText' as const },
                { label: 'Contract enforcement', key: 'contractEnforcementText' as const },
                { label: 'Corruption', key: 'corruptionText' as const },
                { label: 'Next election', key: 'nextElection' as const },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'grid',
                  gridTemplateColumns: `140px repeat(${compared.length}, 1fr)`,
                  gap: '0.5rem', marginBottom: '0.4rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{row.label}</div>
                  {compared.map(c => (
                    <div key={c.name} style={{
                      fontSize: '0.75rem', color: '#a0aec0',
                      background: '#161c27', borderRadius: 4, padding: '0.3rem 0.5rem',
                    }}>
                      {c[row.key]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
