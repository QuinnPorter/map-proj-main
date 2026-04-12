import { useState } from 'react';
import type { CountryResult, PillarWeights } from '../types';
import { PILLARS } from '../scoring/engine';
import { EVIDENCE } from '../data/evidenceData';
import SubnationalPanel from './SubnationalPanel';
import ResearchAssistant from './ResearchAssistant';
import LeadershipSentiment from './LeadershipSentiment';

interface Props {
  result: CountryResult;
  showCustom: boolean;
  isSelected: boolean;
  onToggleCompare: (name: string) => void;
  canAddCompare: boolean;
  weights: PillarWeights;
}

const SCORE_BG = (s: number) => {
  if (s >= 70) return { bg: '#f0faf5', text: '#2e7d52', border: '#b8e0cc' };
  if (s >= 50) return { bg: '#fef9ec', text: '#b07d1a', border: '#f5e6b2' };
  if (s >= 30) return { bg: '#fff4ec', text: '#c05020', border: '#f5d4b2' };
  return { bg: '#fdf0f0', text: '#c0392b', border: '#f5c6c6' };
};

export default function CountryCard({ result, showCustom, isSelected, onToggleCompare, canAddCompare, weights }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'country' | 'regions' | 'research' | 'leadership'>('country');
  const [activeEvidencePillar, setActiveEvidencePillar] = useState<string | null>(null);

  const rank = showCustom ? result.customRank : result.defaultRank;
  const score = showCustom ? result.customScore : result.defaultScore;
  const rankChange = result.rankChange;
  const colors = SCORE_BG(score);
  const pendingPillars = result.pillars.filter(p => p.score < 0);

  return (
    <div style={{
      background: result.excluded ? '#fdf5f5' : '#fff',
      border: `1px solid ${isSelected ? '#3d7be8' : result.excluded ? '#f5c6c6' : '#e2e6ea'}`,
      borderRadius: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        
        {/* Rank badge */}
        <div style={{
          minWidth: 38, height: 38, borderRadius: 8,
          background: result.excluded ? '#fdf0f0' : colors.bg,
          border: `1px solid ${result.excluded ? '#f5c6c6' : colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 800,
          color: result.excluded ? '#c0392b' : colors.text,
        }}>
          {result.excluded ? '–' : rank}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#1a2035', fontSize: '1rem' }}>{result.name}</span>
            {showCustom && !result.excluded && rankChange !== 0 && (
              <span style={{
                fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: 4, fontWeight: 700,
                background: rankChange > 0 ? '#e8f5e9' : '#fde8e8',
                color: rankChange > 0 ? '#2e7d52' : '#c0392b',
              }}>
                {rankChange > 0 ? `▲ ${rankChange}` : `▼ ${Math.abs(rankChange)}`}
              </span>
            )}
            {result.excluded && (
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: 4, background: '#fde8e8', color: '#c0392b', fontWeight: 600 }}>
                Excluded
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.73rem', color: '#8a9ab0', marginTop: 2 }}>
            {result.economicCommunity} · Pop. {result.population}
          </div>
        </div>

        {!result.excluded && (
          <div style={{
            textAlign: 'center', background: colors.bg,
            border: `1px solid ${colors.border}`, borderRadius: 8,
            padding: '0.35rem 0.6rem', minWidth: 52,
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.62rem', color: '#8a9ab0' }}>/100</div>
          </div>
        )}

        {!result.excluded && (
          <button
            onClick={() => onToggleCompare(result.name)}
            disabled={!isSelected && !canAddCompare}
            style={{
              background: isSelected ? '#eef2ff' : 'transparent',
              border: `1px solid ${isSelected ? '#3d7be8' : '#e2e6ea'}`,
              borderRadius: 6, color: isSelected ? '#3d7be8' : '#8a9ab0',
              cursor: (!isSelected && !canAddCompare) ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem', padding: '0.3rem 0.5rem', fontFamily: 'inherit',
              opacity: (!isSelected && !canAddCompare) ? 0.4 : 1, fontWeight: 600,
            }}
          >
            {isSelected ? '✓' : '⊕'}
          </button>
        )}

        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', color: '#8a9ab0', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem', lineHeight: 1 }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Pillar mini bars */}
      {!result.excluded && (
        <div style={{ padding: '0 1.1rem 0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: 24 }}>
          {PILLARS.map(pd => {
            const p = result.pillars.find(x => x.id === pd.id);
            if (!p || p.score < 0) return <div key={pd.id} style={{ flex: 1, height: 3, background: '#f1f3f5', borderRadius: 2, alignSelf: 'flex-end' }} />;
            return (
              <div key={pd.id} title={`${pd.shortName}: ${p.score}/100`} style={{
                flex: 1, height: `${Math.max(3, Math.round(p.score * 0.22))}px`,
                background: pd.color, borderRadius: 2, opacity: 0.75, alignSelf: 'flex-end',
              }} />
            );
          })}
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f1f3f5' }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', background: '#f8f9fb',
            borderBottom: '1px solid #e2e6ea', padding: '0 1.1rem',
          }}>
            {([
              { key: 'country',    label: '🌍 Country' },
              { key: 'regions',    label: '📍 Regions' },
              { key: 'research',   label: '📚 Research' },
              { key: 'leadership', label: '🎙️ Leadership' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '0.6rem 0.85rem', border: 'none', background: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? '#3d7be8' : 'transparent'}`,
                color: activeTab === tab.key ? '#3d7be8' : '#8a9ab0',
                fontSize: '0.75rem', fontWeight: activeTab === tab.key ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>{tab.label}</button>
            ))}
          </div>

          <div style={{ padding: '1rem 1.1rem' }}>

            {/* ── Country tab ── */}
            {activeTab === 'country' && (
              <>
                {result.excluded && (
                  <div style={{ marginBottom: '0.75rem', background: '#fde8e8', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c0392b', fontWeight: 600, marginBottom: '0.25rem' }}>Excluded because:</div>
                    {result.exclusionReasons.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: '#7a1a1a' }}>• {r}</div>
                    ))}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pillar breakdown
                  </div>
                  {PILLARS.map(pd => {
                    const p = result.pillars.find(x => x.id === pd.id);
                    if (!p) return null;
                    const isPending = p.score < 0;
                    const ev = EVIDENCE.find(e => e.pillarId === pd.id);
                    const evOpen = activeEvidencePillar === pd.id;

                    return (
                      <div key={pd.id} style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#1a2035', fontWeight: 500 }}>{p.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {ev && (
                              <button onClick={() => setActiveEvidencePillar(evOpen ? null : pd.id)} style={{
                                background: evOpen ? '#eef2ff' : 'transparent',
                                border: `1px solid ${evOpen ? '#3d7be8' : '#e2e6ea'}`,
                                borderRadius: 4, color: evOpen ? '#3d7be8' : '#8a9ab0',
                                cursor: 'pointer', fontSize: '0.65rem', padding: '0.1rem 0.35rem',
                                fontFamily: 'inherit',
                              }}>📚</button>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isPending ? '#c0c8d4' : pd.color }}>
                              {isPending ? 'pending' : `${p.score}/100`}
                            </span>
                          </div>
                        </div>
                        {!isPending && (
                          <div style={{ height: 5, background: '#f1f3f5', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${p.score}%`, background: pd.color, borderRadius: 3, opacity: 0.8 }} />
                          </div>
                        )}
                        {!isPending && p.drivers.map((d, i) => (
                          <div key={i} style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: '0.1rem' }}>· {d}</div>
                        ))}
                        {evOpen && ev && (
                          <div style={{ marginTop: '0.5rem', background: '#f8f9fb', border: `1px solid ${pd.color}30`, borderRadius: 6, padding: '0.75rem' }}>
                            <div style={{ fontSize: '0.72rem', color: pd.color, fontWeight: 600, marginBottom: '0.35rem' }}>
                              {ev.confidence === 'strong' ? '✓ Strong evidence' : ev.confidence === 'moderate' ? '~ Moderate evidence' : '⚡ Mixed/pending'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#1a2035', lineHeight: 1.6, marginBottom: '0.5rem' }}>{ev.keyInsight}</div>
                            <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginBottom: '0.5rem' }}>
                              <strong>Data:</strong> {ev.dataSource}
                            </div>
                            {ev.citations.map((c, i) => (
                              <div key={i} style={{ background: '#fff', borderRadius: 4, padding: '0.4rem 0.6rem', marginBottom: '0.3rem', border: '1px solid #e2e6ea' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#3d7be8' }}>{c.authors} ({c.year}) — {c.journal}</div>
                                <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: '0.1rem' }}>{c.finding}</div>
                              </div>
                            ))}
                            <div style={{ fontSize: '0.68rem', color: '#8a9ab0', marginTop: '0.35rem', fontStyle: 'italic' }}>{ev.yourDataNote}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {pendingPillars.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginBottom: '0.75rem', background: '#f8f9fb', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                    ⚠ {pendingPillars.map(p => p.name).join(', ')} — data coming soon
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {[
                    ['Corporate tax', result.corporateTax], ['VAT', result.vatTax],
                    ['GDP per capita', result.gdpPerCapita ?? ''], ['GDP growth', result.gdpGrowth ?? ''],
                    ['Inflation', result.inflation ?? ''], ['Govt debt / GDP', result.debtGdp ?? ''],
                    ['FX convertibility', result.fxConvertibility ?? ''], ['Doing business', result.doingBusiness ?? ''],
                    ['Key exports', result.naturalResources ? result.naturalResources.substring(0, 40) + (result.naturalResources.length > 40 ? '…' : '') : ''],
                    ['Legal system', result.legalSystem], ['Next election', result.nextElection],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ background: '#f8f9fb', borderRadius: 6, padding: '0.5rem 0.65rem', border: '1px solid #e2e6ea' }}>
                      <div style={{ fontSize: '0.68rem', color: '#8a9ab0', marginBottom: '0.1rem' }}>{label}</div>
                      <div style={{ fontSize: '0.76rem', color: '#1a2035', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Sanctions panel */}
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{
                    background: !result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#f0faf5' : result.sanctionsLevel.includes('High') ? '#fdf0f0' : '#fef9ec',
                    border: `1px solid ${!result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#b8e0cc' : result.sanctionsLevel.includes('High') ? '#f5c6c6' : '#f5e6b2'}`,
                    borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '0.4rem',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: !result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#2e7d52' : result.sanctionsLevel.includes('High') ? '#c0392b' : '#b07d1a', marginBottom: '0.2rem' }}>
                      {!result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '✓' : '⚠'} Sanctions: {result.sanctionsLevel || 'Clean'}
                    </div>
                    <div style={{ fontSize: '0.71rem', color: '#4a5568', lineHeight: 1.5 }}>{result.sanctionsNotes || 'No active country-level sanctions'}</div>
                    {result.sanctionsLevel && result.sanctionsLevel !== 'Clean' && (
                      <div style={{ fontSize: '0.69rem', color: '#8a9ab0', marginTop: '0.2rem' }}>
                        UN: {result.sanctionsUN} · US: {result.sanctionsUS} · EU: {result.sanctionsEU}
                      </div>
                    )}
                  </div>

                  {/* Nationalisation panel */}
                  {result.nationalisationRisk && (
                    <div style={{
                      background: ['Very High', 'High'].includes(result.nationalisationRisk) ? '#fdf0f0' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#fef9ec' : '#f0faf5',
                      border: `1px solid ${['Very High', 'High'].includes(result.nationalisationRisk) ? '#f5c6c6' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#f5e6b2' : '#b8e0cc'}`,
                      borderRadius: 6, padding: '0.6rem 0.75rem',
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: ['Very High', 'High'].includes(result.nationalisationRisk) ? '#c0392b' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#b07d1a' : '#2e7d52', marginBottom: '0.2rem' }}>
                        {['Very High', 'High'].includes(result.nationalisationRisk) ? '⚠' : ['Low', 'Very Low'].includes(result.nationalisationRisk) ? '✓' : '~'} Nationalisation risk: {result.nationalisationRisk}
                      </div>
                      <div style={{ fontSize: '0.71rem', color: '#4a5568', lineHeight: 1.5 }}>
                        {result.nationalisationNotes ? result.nationalisationNotes.substring(0, 160) + (result.nationalisationNotes.length > 160 ? '…' : '') : ''}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Regions tab ── */}
            {activeTab === 'regions' && (
              <SubnationalPanel countryName={result.name} weights={weights} />
            )}

            {/* ── Research tab ── */}
            {activeTab === 'research' && (
              <ResearchAssistant countryName={result.name} />
            )}

            {/* ── Leadership tab ── */}
            {activeTab === 'leadership' && (
              <LeadershipSentiment countryName={result.name} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
