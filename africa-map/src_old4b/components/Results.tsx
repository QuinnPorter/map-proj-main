import { useState, useMemo } from 'react';
import type { InvestorProfile, CountryResult } from '../types';
import { scoreCountries, DEFAULT_WEIGHTS, PILLARS } from '../scoring/engine';
import { PEER_GROUPS } from '../data/peerGroups';
import { SCENARIOS, applyScenario } from '../scoring/scenarios';
import CountryCard from './CountryCard';
import ComparePanel from './ComparePanel';
import TopMoversPanel from './TopMoversPanel';

// Pillar → questions that affect it
const PILLAR_QUESTION_MAP: Record<string, string[]> = {
  political: ['Q5 (property vs stability)', 'Q9 (risk tolerance)', 'Q12 (political disruption limit)'],
  ruleOfLaw: ['Q5 (property vs stability)', 'Q8 (legal vs infra)', 'Q11 (contract enforcement red line)'],
  fx: ['Q7 (repatriation vs market)', 'Q10 (capital controls red line)'],
  macro: ['Q6 (growth vs macro)', 'Q9 (risk tolerance)'],
  marketDepth: ['Q3 (exit importance)', 'Q7 (repatriation vs market)'],
  infrastructure: ['Q8 (legal vs infra)'],
  growth: ['Q4 (return preference)', 'Q6 (growth vs macro)', 'Q7 (repatriation vs market)'],
};

interface Props {
  profile: InvestorProfile;
  onReset: () => void;
}

export default function Results({ profile, onReset }: Props) {
  const [showCustom, setShowCustom] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');
  const [peerGroupId, setPeerGroupId] = useState('all');
  const [scenarioId, setScenarioId] = useState('none');
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);

  const baseResults = useMemo(
    () => scoreCountries(profile.weights, profile.filters),
    [profile]
  );

  const scenarioResults = useMemo(
    () => applyScenario(baseResults, scenarioId),
    [baseResults, scenarioId]
  );

  // Re-rank after scenario
  const results: CountryResult[] = useMemo(() => {
    const list = [...scenarioResults];
    const defSorted = [...list].sort((a, b) => b.defaultScore - a.defaultScore);
    defSorted.forEach((r, i) => { r.defaultRank = i + 1; });
    const custSorted = [...list].sort((a, b) => {
      if (a.excluded && !b.excluded) return 1;
      if (!a.excluded && b.excluded) return -1;
      return b.customScore - a.customScore;
    });
    custSorted.forEach((r, i) => { r.customRank = i + 1; });
    list.forEach(r => { r.rankChange = r.defaultRank - r.customRank; });
    return list;
  }, [scenarioResults]);

  const peerGroup = PEER_GROUPS.find(g => g.id === peerGroupId);
  const currentScenario = SCENARIOS.find(s => s.id === scenarioId);

  const displayed = useMemo(() => {
    let list = [...results];
    if (peerGroup && peerGroup.countries.length > 0) {
      list = list.filter(r => peerGroup.countries.includes(r.name));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.economicCommunity.toLowerCase().includes(q));
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => {
        if (showCustom) {
          if (a.excluded && !b.excluded) return 1;
          if (!a.excluded && b.excluded) return -1;
          return a.customRank - b.customRank;
        }
        return a.defaultRank - b.defaultRank;
      });
    }
    return list;
  }, [results, peerGroup, search, sortBy, showCustom]);

  const top3 = results.filter(r => !r.excluded)
    .sort((a, b) => showCustom ? a.customRank - b.customRank : a.defaultRank - b.defaultRank)
    .slice(0, 3);

  const excluded = results.filter(r => r.excluded).length;

  function toggleCompare(name: string) {
    setCompareSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e8ecf0', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#e8ecf0' }}>Africa Investability Rankings</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
              {profile.label} · {profile.description}
            </p>
          </div>
          <button onClick={onReset} style={{
            background: 'none', border: '1px solid #2a3245', borderRadius: 6,
            color: '#6b7280', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
          }}>← Edit profile</button>
        </div>

        {/* Score mode toggle */}
        <div style={{ display: 'flex', background: '#161c27', border: '1px solid #2a3245', borderRadius: 8, padding: 4, marginBottom: '1.25rem', width: 'fit-content' }}>
          {[
            { key: true, label: 'Your custom ranking' },
            { key: false, label: 'Default ranking' },
          ].map(opt => (
            <button key={String(opt.key)} onClick={() => setShowCustom(opt.key)} style={{
              padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
              background: showCustom === opt.key ? '#3d7be8' : 'transparent',
              color: showCustom === opt.key ? '#fff' : '#6b7280',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{opt.label}</button>
          ))}
        </div>

        {/* Weight summary + pillar-question link */}
        {showCustom && (
          <div style={{ background: '#161c27', border: '1px solid #2a3245', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your pillar weights — derived from your questionnaire answers
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {PILLARS.map(pd => {
                const w = profile.weights[pd.id];
                return (
                  <div key={pd.id} title={`Influenced by: ${PILLAR_QUESTION_MAP[pd.id]?.join(', ')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: '#1e2535', borderRadius: 4, padding: '0.25rem 0.5rem',
                    cursor: 'help',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pd.color }} />
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{pd.shortName}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7db4f0' }}>{w}%</span>
                  </div>
                );
              })}
            </div>
            {excluded > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#d0604a' }}>
                {excluded} {excluded === 1 ? 'country' : 'countries'} excluded by your hard filters
              </div>
            )}
          </div>
        )}

        {/* Scenario selector */}
        <div style={{ background: '#161c27', border: '1px solid #2a3245', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scenario analysis
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenarioId(s.id)} style={{
                padding: '0.3rem 0.7rem', borderRadius: 6,
                background: scenarioId === s.id ? '#1a2e50' : '#1e2535',
                border: `1px solid ${scenarioId === s.id ? '#3d7be8' : '#2a3245'}`,
                color: scenarioId === s.id ? '#7db4f0' : '#6b7280',
                fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          {currentScenario && currentScenario.id !== 'none' && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a0aec0', lineHeight: 1.5 }}>
              {currentScenario.description} · <span style={{ color: '#4a5568' }}>{currentScenario.source}</span>
            </div>
          )}
        </div>

        {/* Top movers + what-if */}
        <TopMoversPanel results={results} profile={profile} showCustom={showCustom} />

        {/* Top 3 */}
        <div style={{ background: '#161c27', border: '1px solid #2a3245', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top markets for your profile{scenarioId !== 'none' ? ` — ${currentScenario?.label} scenario` : ''}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {top3.map((r, i) => (
              <div key={r.name} style={{ flex: '1 1 140px', background: '#1e2535', borderRadius: 6, padding: '0.6rem 0.8rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#3d7be8', fontWeight: 600 }}>#{i + 1}</div>
                <div style={{ fontWeight: 700, color: '#e8ecf0', fontSize: '1rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Score: {showCustom ? r.customScore : r.defaultScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peer group + search + sort + compare */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={peerGroupId} onChange={e => setPeerGroupId(e.target.value)} style={{
            padding: '0.5rem 0.75rem', background: '#161c27', border: '1px solid #2a3245',
            borderRadius: 6, color: '#a0aec0', fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer',
          }}>
            {PEER_GROUPS.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search countries…" style={{
            flex: 1, minWidth: 150, padding: '0.5rem 0.75rem',
            background: '#161c27', border: '1px solid #2a3245', borderRadius: 6,
            color: '#e8ecf0', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
          }} />

          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'rank' | 'name')} style={{
            padding: '0.5rem 0.75rem', background: '#161c27', border: '1px solid #2a3245',
            borderRadius: 6, color: '#a0aec0', fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <option value="rank">By rank</option>
            <option value="name">A–Z</option>
          </select>

          {compareSelected.length > 0 && (
            <button onClick={() => setShowComparePanel(true)} style={{
              padding: '0.5rem 0.9rem', background: '#1a2e50',
              border: '1px solid #3d7be8', borderRadius: 6,
              color: '#7db4f0', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Compare ({compareSelected.length})
            </button>
          )}
        </div>

        {/* Country list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {displayed.map(r => (
            <CountryCard
              key={r.name}
              result={r}
              showCustom={showCustom}
              isSelected={compareSelected.includes(r.name)}
              onToggleCompare={toggleCompare}
              canAddCompare={compareSelected.length < 3}
              profile={profile}
            />
          ))}
        </div>

        {/* Methodology note */}
        <div style={{
          marginTop: '2rem', padding: '1rem', background: '#161c27',
          border: '1px solid #2a3245', borderRadius: 8,
          fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#6b7280' }}>Methodology note:</strong> Political stability,
          rule of law, and growth pillars are derived from current national-level data (V-Dem,
          World Bank WGI, TI CPI, Freedom House, Numbeo 2026). Infrastructure scores use
          subnational data where available (34/54 countries). FX/capital mobility,
          macroeconomic stability, and market depth data are pending.
          Scenario adjustments are evidence-informed estimates, not live data.
          Click 📚 Research on any pillar to see the academic basis.
        </div>
      </div>

      {/* Compare modal */}
      {showComparePanel && (
        <ComparePanel
          countries={results}
          selected={compareSelected}
          onToggle={toggleCompare}
          onClose={() => setShowComparePanel(false)}
        />
      )}
    </div>
  );
}
