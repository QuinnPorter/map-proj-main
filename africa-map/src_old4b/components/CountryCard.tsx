import { useState } from 'react';
import type { CountryResult, InvestorProfile } from '../types';
import { PILLARS } from '../scoring/engine';
import { EVIDENCE } from '../data/evidenceData';
import SubnationalPanel from './SubnationalPanel';

interface Props {
  result: CountryResult;
  showCustom: boolean;
  isSelected: boolean;
  onToggleCompare: (name: string) => void;
  canAddCompare: boolean;
  profile: InvestorProfile;
}

type Tab = 'pillars' | 'regions';

export default function CountryCard({ result, showCustom, isSelected, onToggleCompare, canAddCompare, profile }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('pillars');
  const [activeEvidencePillar, setActiveEvidencePillar] = useState<string | null>(null);

  const rank = showCustom ? result.customRank : result.defaultRank;
  const score = showCustom ? result.customScore : result.defaultScore;
  const rankChange = result.rankChange;
  const availablePillars = result.pillars.filter(p => p.score >= 0);
  const pendingPillars = result.pillars.filter(p => p.score < 0);

  return (
    <div style={{
      background: result.excluded ? '#160d0d' : '#161c27',
      border: `1px solid ${isSelected ? '#3d7be8' : result.excluded ? '#4a1c1c' : '#2a3245'}`,
      borderRadius: 10, padding: '1rem 1.25rem',
      opacity: result.excluded ? 0.6 : 1,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          minWidth: 36, height: 36, borderRadius: 6, background: result.excluded ? '#2a1a1a' : '#1e2535',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 700, color: result.excluded ? '#7a3a3a' : '#7db4f0',
        }}>
          {result.excluded ? '–' : rank}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#e8ecf0', fontSize: '1rem' }}>{result.name}</span>
            {showCustom && !result.excluded && rankChange !== 0 && (
              <span style={{
                fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600,
                background: rankChange > 0 ? '#0d2a1a' : '#2a1a0d',
                color: rankChange > 0 ? '#4caf82' : '#f0a050',
              }}>
                {rankChange > 0 ? `▲ ${rankChange}` : `▼ ${Math.abs(rankChange)}`}
              </span>
            )}
            {result.excluded && <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#3a1a1a', color: '#d0604a' }}>Excluded</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: 2 }}>
            {result.economicCommunity} · Pop. {result.population}
          </div>
        </div>

        {!result.excluded && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e8ecf0', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>/100</div>
          </div>
        )}

        {!result.excluded && (
          <button
            onClick={() => onToggleCompare(result.name)}
            disabled={!isSelected && !canAddCompare}
            style={{
              background: isSelected ? '#1a2e50' : 'transparent',
              border: `1px solid ${isSelected ? '#3d7be8' : '#2a3245'}`,
              borderRadius: 6, color: isSelected ? '#7db4f0' : '#4a5568',
              cursor: (!isSelected && !canAddCompare) ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem', padding: '0.3rem 0.5rem', fontFamily: 'inherit',
              opacity: (!isSelected && !canAddCompare) ? 0.4 : 1,
            }}
          >{isSelected ? '✓' : '⊕'}</button>
        )}

        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', lineHeight: 1 }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Pillar bars */}
      {!result.excluded && availablePillars.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.3rem', alignItems: 'flex-end', height: 28 }}>
          {PILLARS.map(pd => {
            const p = result.pillars.find(x => x.id === pd.id);
            if (!p || p.score < 0) return <div key={pd.id} style={{ flex: 1, height: 4, background: '#1e2535', borderRadius: 2, alignSelf: 'flex-end' }} />;
            return <div key={pd.id} title={`${pd.shortName}: ${p.score}/100`} style={{ flex: 1, height: `${Math.max(4, Math.round(p.score * 0.28))}px`, background: pd.color, borderRadius: 2, opacity: 0.8, alignSelf: 'flex-end' }} />;
          })}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #2a3245', paddingTop: '1rem' }}>

          {result.excluded && result.exclusionReasons.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#d0604a', fontWeight: 600, marginBottom: '0.3rem' }}>Excluded because:</div>
              {result.exclusionReasons.map((r, i) => <div key={i} style={{ fontSize: '0.8rem', color: '#a0504a', marginBottom: '0.15rem' }}>• {r}</div>)}
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            {(['pillars', 'regions'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '0.3rem 0.8rem', borderRadius: 6, border: 'none',
                background: activeTab === tab ? '#3d7be8' : '#1e2535',
                color: activeTab === tab ? '#fff' : '#6b7280',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {tab === 'pillars' ? '📊 National pillars' : '🗺 Regions'}
              </button>
            ))}
          </div>

          {/* Pillars tab */}
          {activeTab === 'pillars' && (
            <>
              {PILLARS.map(pd => {
                const p = result.pillars.find(x => x.id === pd.id);
                if (!p) return null;
                const isPending = p.score < 0;
                const evidence = EVIDENCE.find(e => e.pillarId === pd.id);
                const isEvidenceOpen = activeEvidencePillar === pd.id;

                return (
                  <div key={pd.id} style={{ marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{p.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {evidence && (
                          <button onClick={() => setActiveEvidencePillar(isEvidenceOpen ? null : pd.id)} style={{
                            background: isEvidenceOpen ? '#1e2535' : 'transparent',
                            border: `1px solid ${isEvidenceOpen ? pd.color : '#2a3245'}`,
                            borderRadius: 4, color: isEvidenceOpen ? pd.color : '#4a5568',
                            cursor: 'pointer', fontSize: '0.65rem', padding: '0.1rem 0.4rem', fontFamily: 'inherit',
                          }}>📚 Research</button>
                        )}
                        <span style={{ fontSize: '0.8rem', color: isPending ? '#4a5568' : pd.color, fontWeight: 600 }}>
                          {isPending ? 'pending' : `${p.score}/100`}
                        </span>
                      </div>
                    </div>
                    {!isPending && (
                      <div style={{ height: 4, background: '#1e2535', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${p.score}%`, background: pd.color, borderRadius: 2, opacity: 0.85 }} />
                      </div>
                    )}
                    {!isPending && p.drivers.map((d, i) => <div key={i} style={{ fontSize: '0.72rem', color: '#4a5568', marginTop: '0.1rem' }}>· {d}</div>)}

                    {isEvidenceOpen && evidence && (
                      <div style={{ marginTop: '0.5rem', background: '#0d1117', border: `1px solid ${pd.color}30`, borderRadius: 6, padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: pd.color, fontWeight: 600, marginBottom: '0.4rem' }}>
                          Research basis — {evidence.confidence === 'strong' ? '✓ Strong' : evidence.confidence === 'moderate' ? '~ Moderate' : '⚡ Mixed/pending'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#a0aec0', lineHeight: 1.6, marginBottom: '0.6rem' }}>{evidence.keyInsight}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          <strong style={{ color: '#4a5568' }}>Data source:</strong> {evidence.dataSource}
                        </div>
                        {evidence.citations.map((c, i) => (
                          <div key={i} style={{ background: '#161c27', borderRadius: 4, padding: '0.4rem 0.6rem', marginBottom: '0.3rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#7db4f0' }}>{c.authors} ({c.year}) — {c.journal}</div>
                            <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginTop: '0.15rem' }}>{c.finding}</div>
                          </div>
                        ))}
                        <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: '0.4rem', fontStyle: 'italic' }}>{evidence.yourDataNote}</div>
                      </div>
                    )}
                  </div>
                );
              })}

              {pendingPillars.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: '0.75rem' }}>
                  ⚠ {pendingPillars.map(p => p.name).join(', ')} — data coming soon
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  ['Corporate tax', result.corporateTax], ['VAT', result.vatTax],
                  ['Res. dividend tax', result.resDividendTax], ['Non-res. dividend tax', result.nonResDividendTax],
                  ['Legal system', result.legalSystem], ['Next election', result.nextElection],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#1e2535', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#4a5568', marginBottom: '0.15rem' }}>{label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#c4cdd8' }}>{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Regions tab */}
          {activeTab === 'regions' && (
            <SubnationalPanel countryName={result.name} profile={profile} />
          )}
        </div>
      )}
    </div>
  );
}
