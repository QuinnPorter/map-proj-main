import { useState } from 'react';
import type { InvestorProfile } from '../types';
import { PILLARS } from '../scoring/engine';

interface Props {
  profile: InvestorProfile;
}

const PILLAR_NAME_MAP: Record<string, string> = {
  political: 'Political', ruleOfLaw: 'Rule of Law', fx: 'FX & Capital',
  macro: 'Macro', marketDepth: 'Market Depth', infrastructure: 'Infrastructure', growth: 'Growth',
};

export default function AlgorithmPanel({ profile }: Props) {
  const [open, setOpen] = useState(false);

  const sortedPillars = [...PILLARS].sort(
    (a, b) => (profile.weights[b.id] ?? 0) - (profile.weights[a.id] ?? 0)
  );

  return (
    <div style={{
      background: '#f8f9fb', border: '1px solid #e2e6ea',
      borderRadius: 10, marginBottom: '1.25rem', overflow: 'hidden',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '0.85rem 1.1rem',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2035' }}>
            ⚙️ How your score was calculated
          </span>
          <span style={{
            fontSize: '0.7rem', padding: '0.15rem 0.5rem',
            background: '#e8f0fe', borderRadius: 4, color: '#3d7be8', fontWeight: 600,
          }}>
            {profile.label}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>

          {/* Profile description */}
          <div style={{
            background: '#eef2ff', borderRadius: 8, padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.25rem' }}>
              Your investor profile
            </div>
            <div style={{ fontSize: '0.85rem', color: '#1a2035', lineHeight: 1.5 }}>
              {profile.description}
            </div>
          </div>

          {/* How the algorithm works */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              How the algorithm works
            </div>
            <div style={{ fontSize: '0.82rem', color: '#4a5568', lineHeight: 1.65 }}>
              Your questionnaire answers adjusted the weight assigned to each of 7 investability pillars.
              Each country is scored 0–100 on each pillar using national and subnational data.
              Your custom score is a weighted average of those pillar scores, with hard filters applied first
              to exclude markets that breach your red lines.
              Research confidence ratings from the academic evidence layer
              are noted per pillar but do not currently alter weights — they inform your interpretation.
              Leadership sentiment scores (when added) appear as a separate indicator and can optionally
              be incorporated into the ranking.
            </div>
          </div>

          {/* Final pillar weights */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your final pillar weights
            </div>
            {sortedPillars.map(pd => {
              const w = profile.weights[pd.id] ?? 0;
              return (
                <div key={pd.id} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#1a2035' }}>{pd.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pd.color }}>{w}%</span>
                  </div>
                  <div style={{ height: 5, background: '#e2e6ea', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', width: `${w}%`,
                      background: pd.color, borderRadius: 3, opacity: 0.85,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer trace */}
          {profile.answerTrace && profile.answerTrace.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                How your answers shaped the weights
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {profile.answerTrace.map((item, i) => (
                  <div key={i} style={{
                    background: '#fff', border: '1px solid #e2e6ea',
                    borderRadius: 6, padding: '0.5rem 0.75rem',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.questionText}: </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a2035' }}>{item.answerLabel}</span>
                    </div>
                    {item.pillarEffects.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {item.pillarEffects.map((e, j) => (
                          <span key={j} style={{
                            fontSize: '0.68rem', padding: '0.1rem 0.4rem',
                            borderRadius: 4, fontWeight: 600,
                            background: e.delta > 0 ? '#e8f5e9' : '#fde8e8',
                            color: e.delta > 0 ? '#2e7d52' : '#c0392b',
                          }}>
                            {e.pillar} {e.delta > 0 ? `+${e.delta}` : e.delta}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.pillarEffects.length === 0 && (
                      <span style={{ fontSize: '0.68rem', color: '#a0aec0' }}>sets baseline</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hard filters */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e6ea' }}>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your hard filters (red lines)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {[
                { label: 'Capital controls', active: profile.filters.excludeCapitalControls },
                { label: 'Weak contracts', active: profile.filters.excludeWeakContracts },
                { label: 'High political disruption', active: profile.filters.maxPoliticalDisruption !== 'high' },
                { label: 'Illiquidity', active: profile.filters.requireLiquidity },
              ].map(f => (
                <span key={f.label} style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 4,
                  background: f.active ? '#fde8e8' : '#f1f3f5',
                  color: f.active ? '#c0392b' : '#a0aec0',
                  border: `1px solid ${f.active ? '#f5c6c6' : '#e2e6ea'}`,
                  fontWeight: f.active ? 600 : 400,
                }}>
                  {f.active ? '✗' : '○'} Exclude: {f.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
