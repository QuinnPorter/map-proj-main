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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e2e6ea', borderRadius: 12,
        width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto',
        padding: '1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a2035' }}>Country comparison</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a9ab0', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {compared.length === 0 && (
          <p style={{ color: '#8a9ab0', fontSize: '0.9rem' }}>Select up to 3 countries using the ⊕ button on each card.</p>
        )}

        {compared.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${compared.length}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
              <div />
              {compared.map(c => (
                <div key={c.name} style={{ background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem', textAlign: 'center', position: 'relative' }}>
                  <button onClick={() => onToggle(c.name)} style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: '#8a9ab0', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  <div style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8a9ab0', marginBottom: '0.4rem' }}>{c.economicCommunity}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3d7be8' }}>{c.customScore}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8a9ab0' }}>Rank #{c.customRank}</div>
                </div>
              ))}
            </div>

            {PILLARS.map(pd => (
              <div key={pd.id} style={{ display: 'grid', gridTemplateColumns: `160px repeat(${compared.length}, 1fr)`, gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#4a5568' }}>{pd.shortName}</div>
                {compared.map(c => {
                  const p = c.pillars.find(x => x.id === pd.id);
                  const isPending = !p || p.score < 0;
                  const score = isPending ? null : p!.score;
                  const scores = compared.map(cc => cc.pillars.find(x => x.id === pd.id)?.score ?? -1).filter(s => s >= 0);
                  const isTop = score !== null && score === Math.max(...scores) && scores.length > 1;
                  return (
                    <div key={c.name} style={{ background: '#f8f9fb', borderRadius: 6, padding: '0.45rem 0.65rem', border: isTop ? `1px solid ${pd.color}60` : '1px solid transparent' }}>
                      {isPending ? (
                        <div style={{ fontSize: '0.72rem', color: '#c0c8d4' }}>pending</div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isTop ? pd.color : '#1a2035' }}>{score}/100</span>
                            {isTop && <span style={{ fontSize: '0.62rem', color: pd.color }}>best</span>}
                          </div>
                          <div style={{ height: 3, background: '#e2e6ea', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${score}%`, background: pd.color, borderRadius: 2 }} />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e6ea', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key facts</div>
              {[
                { label: 'Population', key: 'population' as const },
                { label: 'Corporate tax', key: 'corporateTax' as const },
                { label: 'Political stability', key: 'politicalStabilityText' as const },
                { label: 'Contract enforcement', key: 'contractEnforcementText' as const },
                { label: 'Next election', key: 'nextElection' as const },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: `160px repeat(${compared.length}, 1fr)`, gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.73rem', color: '#8a9ab0' }}>{row.label}</div>
                  {compared.map(c => (
                    <div key={c.name} style={{ fontSize: '0.73rem', color: '#1a2035', background: '#f8f9fb', borderRadius: 4, padding: '0.28rem 0.5rem' }}>{c[row.key]}</div>
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
