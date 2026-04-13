import { useState, useMemo } from 'react';
import type { InvestorProfile, CountryResult } from '../types';
import { scoreCountries, PILLARS } from '../scoring/engine';
import { PEER_GROUPS } from '../data/peerGroups';
import { SCENARIOS, applyScenario } from '../scoring/scenarios';
import CountryCard from './CountryCard';
import ComparePanel from './ComparePanel';
import TopMoversPanel from './TopMoversPanel';
import AlgorithmPanel from './AlgorithmPanel';
import ResearchAssistant from './ResearchAssistant';
import LeadershipSentiment from './LeadershipSentiment';
import CountryDetail from './CountryDetail';

type MainTab = 'rankings' | 'research' | 'leadership';

interface Props {
  profile: InvestorProfile;
  onReset: () => void;
}

export default function Results({ profile, onReset }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>('rankings');
  const [showCustom, setShowCustom] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');
  const [peerGroupId, setPeerGroupId] = useState('all');
  const [scenarioId, setScenarioId] = useState('none');
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [selectedCountryIso, setSelectedCountryIso] = useState<string | null>(null);

  const baseResults = useMemo(() => scoreCountries(profile.weights, profile.filters), [profile]);
  const scenarioResults = useMemo(() => applyScenario(baseResults, scenarioId), [baseResults, scenarioId]);

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
  const excluded = results.filter(r => r.excluded).length;

  const displayed = useMemo(() => {
    let list = [...results];
    if (peerGroup && peerGroup.countries.length > 0) list = list.filter(r => peerGroup.countries.includes(r.name));
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(r => r.name.toLowerCase().includes(q) || r.economicCommunity.toLowerCase().includes(q)); }
    if (sortBy === 'name') { list.sort((a, b) => a.name.localeCompare(b.name)); }
    else {
      list.sort((a, b) => {
        if (showCustom) { if (a.excluded && !b.excluded) return 1; if (!a.excluded && b.excluded) return -1; return a.customRank - b.customRank; }
        return a.defaultRank - b.defaultRank;
      });
    }
    return list;
  }, [results, peerGroup, search, sortBy, showCustom]);

  const top3 = results.filter(r => !r.excluded).sort((a, b) => showCustom ? a.customRank - b.customRank : a.defaultRank - b.defaultRank).slice(0, 3);

  function toggleCompare(name: string) {
    setCompareSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev);
  }

  // If a country is selected, show its detail view
  const selectedResult = selectedCountryIso ? results.find(r => r.iso === selectedCountryIso) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', fontFamily: 'inherit' }}>

      {/* Top nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e6ea',
        padding: '0.85rem 1.5rem', position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3d7be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.9rem' }}>Meridian Analytica</span>
        </div>

        {/* Main tabs — only show when not in country detail */}
        {!selectedResult && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {([
              { key: 'rankings', label: '📊 Rankings' },
              { key: 'research', label: '📚 Research' },
              { key: 'leadership', label: '🎙️ Leadership' },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setMainTab(t.key)} style={{
                padding: '0.4rem 0.85rem', border: 'none',
                background: mainTab === t.key ? '#eef2ff' : 'transparent',
                borderRadius: 6, color: mainTab === t.key ? '#3d7be8' : '#8a9ab0',
                fontSize: '0.8rem', fontWeight: mainTab === t.key ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{t.label}</button>
            ))}
          </div>
        )}

        <button onClick={onReset} style={{
          background: 'none', border: '1px solid #e2e6ea', borderRadius: 6,
          color: '#8a9ab0', padding: '0.4rem 0.9rem', fontSize: '0.78rem',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>← Edit profile</button>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── Country detail view ── */}
        {selectedResult && (
          <CountryDetail
            result={selectedResult}
            profile={profile}
            allResults={results}
            onBack={() => setSelectedCountryIso(null)}
            onNavigateTo={(iso) => setSelectedCountryIso(iso)}
          />
        )}

        {/* ── Rankings tab ── */}
        {!selectedResult && mainTab === 'rankings' && (
          <>
            {/* Profile summary */}
            <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2035', marginBottom: '0.2rem' }}>{profile.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{profile.description}</div>
            </div>

            {/* Algorithm panel */}
            <AlgorithmPanel profile={profile} />

            {/* Score mode toggle */}
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: 3, marginBottom: '1.1rem', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {[{ key: true, label: 'Your custom ranking' }, { key: false, label: 'Default ranking' }].map(opt => (
                <button key={String(opt.key)} onClick={() => setShowCustom(opt.key)} style={{
                  padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
                  background: showCustom === opt.key ? '#3d7be8' : 'transparent',
                  color: showCustom === opt.key ? '#fff' : '#8a9ab0',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{opt.label}</button>
              ))}
            </div>

            {/* Weight chips */}
            {showCustom && (
              <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginBottom: '0.45rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pillar weights — derived from your answers
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {PILLARS.map(pd => (
                    <div key={pd.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8f9fb', borderRadius: 4, padding: '0.22rem 0.5rem', border: '1px solid #e2e6ea' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: pd.color }} />
                      <span style={{ fontSize: '0.72rem', color: '#4a5568' }}>{pd.shortName}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pd.color }}>{profile.weights[pd.id]}%</span>
                    </div>
                  ))}
                </div>
                {excluded > 0 && <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#c0392b' }}>{excluded} {excluded === 1 ? 'country' : 'countries'} excluded by your filters</div>}
              </div>
            )}

            {/* Scenario selector */}
            <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginBottom: '0.45rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scenario analysis</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => setScenarioId(s.id)} style={{
                    padding: '0.28rem 0.7rem', borderRadius: 6,
                    background: scenarioId === s.id ? '#eef2ff' : '#f8f9fb',
                    border: `1px solid ${scenarioId === s.id ? '#3d7be8' : '#e2e6ea'}`,
                    color: scenarioId === s.id ? '#3d7be8' : '#6b7280',
                    fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: scenarioId === s.id ? 600 : 400,
                  }}>{s.icon} {s.label}</button>
                ))}
              </div>
              {currentScenario && currentScenario.id !== 'none' && (
                <div style={{ marginTop: '0.45rem', fontSize: '0.73rem', color: '#6b7280', lineHeight: 1.5 }}>
                  {currentScenario.description} · <span style={{ color: '#a0aec0' }}>{currentScenario.source}</span>
                </div>
              )}
            </div>

            {/* Top movers */}
            <TopMoversPanel results={results} profile={profile} showCustom={showCustom} />

            {/* Top 3 */}
            <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Top markets for your profile{scenarioId !== 'none' ? ` — ${currentScenario?.label}` : ''}
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {top3.map((r, i) => (
                  <div key={r.name} onClick={() => setSelectedCountryIso(r.iso)} style={{ flex: '1 1 150px', background: i === 0 ? '#eef2ff' : '#f8f9fb', border: `1px solid ${i === 0 ? '#c7d7f8' : '#e2e6ea'}`, borderRadius: 8, padding: '0.65rem 0.85rem', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.7rem', color: '#3d7be8', fontWeight: 700 }}>#{i + 1}</div>
                    <div style={{ fontWeight: 700, color: '#1a2035', fontSize: '1rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.73rem', color: '#6b7280' }}>{showCustom ? r.customScore : r.defaultScore}/100</div>
                    <div style={{ fontSize: '0.68rem', color: '#3d7be8', marginTop: 2 }}>View detail →</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters row */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={peerGroupId} onChange={e => setPeerGroupId(e.target.value)} style={{ padding: '0.48rem 0.75rem', background: '#fff', border: '1px solid #e2e6ea', borderRadius: 6, color: '#4a5568', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                {PEER_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search countries…" style={{ flex: 1, minWidth: 150, padding: '0.48rem 0.75rem', background: '#fff', border: '1px solid #e2e6ea', borderRadius: 6, color: '#1a2035', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'rank' | 'name')} style={{ padding: '0.48rem 0.75rem', background: '#fff', border: '1px solid #e2e6ea', borderRadius: 6, color: '#4a5568', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                <option value="rank">By rank</option>
                <option value="name">A–Z</option>
              </select>
              {compareSelected.length > 0 && (
                <button onClick={() => setShowComparePanel(true)} style={{ padding: '0.48rem 0.9rem', background: '#eef2ff', border: '1px solid #3d7be8', borderRadius: 6, color: '#3d7be8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Compare ({compareSelected.length})
                </button>
              )}
            </div>

            {/* Country list — clickable to open detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {displayed.map(r => (
                <div key={r.name} onClick={() => setSelectedCountryIso(r.iso)} style={{ cursor: 'pointer' }}>
                  <CountryCard
                    result={r}
                    showCustom={showCustom}
                    isSelected={compareSelected.includes(r.name)}
                    onToggleCompare={(name: string) => { toggleCompare(name); }}
                    canAddCompare={compareSelected.length < 3}
                    weights={profile.weights}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem 1.1rem', background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, fontSize: '0.72rem', color: '#a0aec0', lineHeight: 1.6 }}>
              <strong style={{ color: '#8a9ab0' }}>Methodology:</strong> Political stability, rule of law, and growth pillars use national-level data (V-Dem, World Bank WGI, TI CPI, Freedom House, Numbeo 2026). Infrastructure uses subnational data where available (34/54 countries). FX, macro, and market depth pillars are pending. Click 📚 inside any pillar for academic sources. Scenario adjustments are evidence-informed estimates. Click any country for ministry routing, AI outreach strategy, and hedge recommendations.
            </div>
          </>
        )}

        {/* ── Research tab ── */}
        {!selectedResult && mainTab === 'research' && (
          <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#1a2035' }}>Research Assistant</h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
              Ask questions about investment evidence, academic literature, and empirical findings across African markets. Draws on V-Dem, World Bank, UNCTAD, AJPS, The World Economy, African Affairs, and more.
            </p>
            <ResearchAssistant />
          </div>
        )}

        {/* ── Leadership tab ── */}
        {!selectedResult && mainTab === 'leadership' && (
          <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#1a2035' }}>Leadership Sentiment Analyser</h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
              Paste any speech, press release, or statement from a national or regional leader to extract investment signals, key phrases, emotional register, and specific commitments. Results can optionally be incorporated into country rankings.
            </p>
            <LeadershipSentiment />
          </div>
        )}
      </div>

      {showComparePanel && (
        <ComparePanel countries={results} selected={compareSelected} onToggle={toggleCompare} onClose={() => setShowComparePanel(false)} />
      )}
    </div>
  );
}
