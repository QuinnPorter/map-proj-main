import { useState } from 'react';
import type { CountryResult, InvestorProfile, PillarWeights } from '../types';
import { PILLARS } from '../scoring/engine';
import { EVIDENCE } from '../data/evidenceData';
import { getIntelligence, getRelevantMinistries } from '../data/countryIntelligence';
import SubnationalPanel from './SubnationalPanel';
import ResearchAssistant from './ResearchAssistant';
import LeadershipSentiment from './LeadershipSentiment';

type Tab = 'country' | 'regions' | 'research' | 'leadership' | 'action' | 'hedge';

interface Props {
  result: CountryResult;
  profile: InvestorProfile;
  allResults: CountryResult[];
  onBack: () => void;
  onNavigateTo: (iso: string) => void;
}

const SECTOR_LABEL: Record<string, string> = {
  diversified: 'Diversified', infrastructure: 'Infrastructure', fintech: 'Financial services',
  agri: 'Agriculture', manufacturing: 'Manufacturing', realestate: 'Real estate',
  extractives: 'Extractives', tech: 'Technology',
};
const TYPE_LABEL: Record<string, string> = {
  public: 'Public markets', pe: 'Private equity', venture: 'Venture / growth',
  corporate: 'Strategic corporate', credit: 'Private credit', impact: 'Impact investor',
};

const SCORE_BG = (s: number) => {
  if (s >= 70) return { bg: '#f0faf5', text: '#2e7d52', border: '#b8e0cc' };
  if (s >= 50) return { bg: '#fef9ec', text: '#b07d1a', border: '#f5e6b2' };
  if (s >= 30) return { bg: '#fff4ec', text: '#c05020', border: '#f5d4b2' };
  return { bg: '#fdf0f0', text: '#c0392b', border: '#f5c6c6' };
};

function LiveScan({ countryName }: { iso: string; countryName: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ headline: string; sentiment: number; signals: { ministry: string; signal: string; tone: string }[]; watchlist: string } | null>(null);

  async function runScan() {
    setState('loading');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: `You are an Africa investment intelligence tool. Based on your knowledge of ${countryName}'s government communications and investment climate as of early 2025, provide a brief intelligence briefing.\n\nReturn ONLY this JSON, no markdown fences:\n{"headline":"One sentence summarising the dominant investment signal from ${countryName}'s government right now","sentiment":72,"signals":[{"ministry":"Ministry name","signal":"One sentence on their current stance","tone":"positive"},{"ministry":"Second ministry","signal":"One sentence","tone":"mixed"}],"watchlist":"One specific development to monitor over the next 3-6 months"}\n\nReplace all placeholder values. sentiment is 0-100. tone is positive, mixed, or negative.` }],
        }),
      });
      const d = await r.json();
      const txt = d.content?.[0]?.text || '';
      const parsed = JSON.parse(txt.replace(/```json|```/g, '').trim());
      setResult(parsed);
      setState('done');
    } catch {
      setState('error');
    }
  }

  const toneColor = (t: string) => t === 'positive' ? '#2e7d52' : t === 'mixed' ? '#b07d1a' : '#c0392b';
  const toneBg = (t: string) => t === 'positive' ? '#f0faf5' : t === 'mixed' ? '#fef9ec' : '#fdf0f0';

  return (
    <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Live AI scan
        </div>
        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#f1f3f5', color: '#6b7280' }}>On demand</span>
      </div>
      <div style={{ padding: '11px 13px' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>AI analysis of recent ministerial statements and investment signals for {countryName}</div>
        {state === 'idle' && <button onClick={runScan} style={{ padding: '7px 13px', border: '1px solid #3d7be8', borderRadius: 6, background: 'transparent', color: '#3d7be8', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Scan latest ministry signals →</button>}
        {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Scanning ministry signals…</div>}
        {state === 'error' && <div style={{ fontSize: '0.78rem', color: '#c0392b' }}>Scan unavailable. <button onClick={runScan} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></div>}
        {state === 'done' && result && (
          <div>
            <div style={{ fontSize: '0.82rem', color: '#1a2035', marginBottom: 7, lineHeight: 1.5 }}>{result.headline}</div>
            <div style={{ height: 5, borderRadius: 3, background: '#e2e6ea', marginBottom: 3, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 3, background: '#22c55e', width: `${Math.min(Math.max(Number(result.sentiment) || 0, 0), 100)}%` }} /></div>
            <div style={{ fontSize: '0.68rem', color: '#166534', marginBottom: 10 }}>{result.sentiment}% positive overall sentiment</div>
            {result.signals.map((s, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.ministry} <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 20, background: toneBg(s.tone), color: toneColor(s.tone), fontWeight: 600 }}>{s.tone}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2, lineHeight: 1.5 }}>{s.signal}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #f59e0b', paddingLeft: 7, lineHeight: 1.5, borderRadius: 0 }}><strong style={{ color: '#1a2035' }}>Watch:</strong> {result.watchlist}</div>
            <button onClick={runScan} style={{ marginTop: 8, padding: '5px 10px', border: '1px solid #e2e6ea', borderRadius: 6, background: 'transparent', color: '#6b7280', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Refresh scan</button>
          </div>
        )}
      </div>
    </div>
  );
}

function OutreachStrategy({ iso, countryName, profile }: { iso: string; countryName: string; profile: InvestorProfile }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ priorities: string; messages: string[]; avoid: string; timing: string } | null>(null);
  const intel = getIntelligence(iso);

  async function generate() {
    setState('loading');
    const typeLabel = TYPE_LABEL[profile.answers.investorType] || 'investor';
    const sectorLabel = SECTOR_LABEL[profile.answers.sectorFocus] || 'diversified';
    const govPriorities = intel?.governmentPriorities.join(', ') || '';
    const ministryNames = intel?.ministries.map(m => m.name).join('; ') || '';
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          messages: [{ role: 'user', content: `You are an Africa investment advisory tool. Generate a concise, practical outreach strategy for approaching ${countryName}'s government.\n\nInvestor: ${typeLabel}, focused on ${sectorLabel}.\nCountry govt priorities: ${govPriorities}.\nKey ministries: ${ministryNames}.\n\nReturn ONLY this JSON, no markdown fences:\n{"priorities":"2 sentences on what this government most wants from investors right now","messages":["Concrete lead message 1","Lead message 2","Lead message 3"],"avoid":"One specific framing or topic to avoid in initial outreach","timing":"One sentence on current timing or entry conditions"}` }],
        }),
      });
      const d = await r.json();
      const txt = d.content?.[0]?.text || '';
      const parsed = JSON.parse(txt.replace(/```json|```/g, '').trim());
      setResult(parsed);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>Generate tailored outreach language based on current government priorities and your investor profile.</div>
      {state === 'idle' && <button onClick={generate} style={{ padding: '8px 14px', background: '#3d7be8', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Generate outreach strategy →</button>}
      {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating outreach strategy…</div>}
      {state === 'error' && <div style={{ fontSize: '0.78rem', color: '#c0392b' }}>Could not generate. <button onClick={generate} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></div>}
      {state === 'done' && result && (
        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e6ea' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Government priorities right now</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>{result.priorities}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Lead with these messages</div>
          <div style={{ marginBottom: 10 }}>
            {result.messages.map((m, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5 }}><span style={{ color: '#3d7be8', fontWeight: 700, flexShrink: 0, fontSize: '0.78rem' }}>{i + 1}.</span><span style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{m}</span></div>)}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Avoid in initial outreach</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{result.avoid}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Timing note</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{result.timing}</div>
          <button onClick={generate} style={{ marginTop: 10, padding: '5px 10px', border: '1px solid #e2e6ea', borderRadius: 6, background: 'transparent', color: '#6b7280', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate</button>
        </div>
      )}
    </div>
  );
}

export default function CountryDetail({ result, profile, allResults, onBack, onNavigateTo }: Props) {
  const [tab, setTab] = useState<Tab>('country');
  const [activeEvidencePillar, setActiveEvidencePillar] = useState<string | null>(null);

  const intel = getIntelligence(result.iso);
  const sector = profile.answers.sectorFocus || 'diversified';
  const weights: PillarWeights = profile.weights;
  const relevantMinistries = intel ? getRelevantMinistries(result.iso, sector) : [];
  const pendingPillars = result.pillars.filter(p => p.score < 0);
  const score = result.customScore || result.defaultScore;
  const colors = SCORE_BG(score);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'country', label: '🌍 Country' },
    { key: 'regions', label: '📍 Regions' },
    { key: 'research', label: '📚 Research' },
    { key: 'leadership', label: '🎙️ Leadership' },
    { key: 'action', label: '⚡ Take action' },
    { key: 'hedge', label: '🔀 Hedge' },
  ];

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e6ea', borderRadius: 6, color: '#6b7280', padding: '5px 10px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Rankings</button>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2035' }}>{result.name}</div>
        <div style={{ marginLeft: 'auto' }}>
          {score > 0 && (
            <div style={{ textAlign: 'center', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '3px 10px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: colors.text }}>{score}</span>
              <span style={{ fontSize: '0.62rem', color: '#8a9ab0' }}>/100 · #{result.customRank || result.defaultRank}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#8a9ab0', marginBottom: '0.75rem' }}>{result.economicCommunity} · Pop. {result.population}</div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: 24, marginBottom: '0.85rem' }}>
        {PILLARS.map(pd => {
          const p = result.pillars.find(x => x.id === pd.id);
          if (!p || p.score < 0) return <div key={pd.id} style={{ flex: 1, height: 3, background: '#f1f3f5', borderRadius: 2, alignSelf: 'flex-end' }} />;
          return <div key={pd.id} title={`${pd.shortName}: ${p.score}/100`} style={{ flex: 1, height: `${Math.max(3, Math.round(p.score * 0.22))}px`, background: pd.color, borderRadius: 2, opacity: 0.75, alignSelf: 'flex-end' }} />;
        })}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e6ea', marginBottom: '1rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '9px 11px', fontSize: '0.74rem', cursor: 'pointer', border: 'none', borderBottom: `2px solid ${tab === t.key ? '#3d7be8' : 'transparent'}`, background: 'none', color: tab === t.key ? '#3d7be8' : '#8a9ab0', fontWeight: tab === t.key ? 700 : 400, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'country' && (
        <>
          {result.excluded && (
            <div style={{ marginBottom: '0.75rem', background: '#fde8e8', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#c0392b', fontWeight: 600, marginBottom: '0.25rem' }}>Excluded because:</div>
              {result.exclusionReasons.map((r, i) => <div key={i} style={{ fontSize: '0.78rem', color: '#7a1a1a' }}>• {r}</div>)}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pillar breakdown</div>
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
                      {ev && <button onClick={() => setActiveEvidencePillar(evOpen ? null : pd.id)} style={{ background: evOpen ? '#eef2ff' : 'transparent', border: `1px solid ${evOpen ? '#3d7be8' : '#e2e6ea'}`, borderRadius: 4, color: evOpen ? '#3d7be8' : '#8a9ab0', cursor: 'pointer', fontSize: '0.65rem', padding: '0.1rem 0.35rem', fontFamily: 'inherit' }}>📚</button>}
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isPending ? '#c0c8d4' : pd.color }}>{isPending ? 'pending' : `${p.score}/100`}</span>
                    </div>
                  </div>
                  {!isPending && <div style={{ height: 5, background: '#f1f3f5', borderRadius: 3 }}><div style={{ height: '100%', width: `${p.score}%`, background: pd.color, borderRadius: 3, opacity: 0.8 }} /></div>}
                  {!isPending && p.drivers.map((d, i) => <div key={i} style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: '0.1rem' }}>· {d}</div>)}
                  {evOpen && ev && (
                    <div style={{ marginTop: '0.5rem', background: '#f8f9fb', border: `1px solid ${pd.color}30`, borderRadius: 6, padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: pd.color, fontWeight: 600, marginBottom: '0.35rem' }}>{ev.confidence === 'strong' ? '✓ Strong evidence' : ev.confidence === 'moderate' ? '~ Moderate evidence' : '⚡ Mixed/pending'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#1a2035', lineHeight: 1.6, marginBottom: '0.5rem' }}>{ev.keyInsight}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginBottom: '0.5rem' }}><strong>Data:</strong> {ev.dataSource}</div>
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
          {pendingPillars.length > 0 && <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginBottom: '0.75rem', background: '#f8f9fb', borderRadius: 6, padding: '0.5rem 0.75rem' }}>⚠ {pendingPillars.map(p => p.name).join(', ')} — data coming soon</div>}
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
          <div style={{ marginTop: '0.6rem' }}>
            <div style={{ background: !result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#f0faf5' : result.sanctionsLevel.includes('High') ? '#fdf0f0' : '#fef9ec', border: `1px solid ${!result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#b8e0cc' : result.sanctionsLevel.includes('High') ? '#f5c6c6' : '#f5e6b2'}`, borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: !result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '#2e7d52' : result.sanctionsLevel.includes('High') ? '#c0392b' : '#b07d1a', marginBottom: '0.2rem' }}>
                {!result.sanctionsLevel || result.sanctionsLevel === 'Clean' ? '✓' : '⚠'} Sanctions: {result.sanctionsLevel || 'Clean'}
              </div>
              <div style={{ fontSize: '0.71rem', color: '#4a5568', lineHeight: 1.5 }}>{result.sanctionsNotes || 'No active country-level sanctions'}</div>
              {result.sanctionsLevel && result.sanctionsLevel !== 'Clean' && <div style={{ fontSize: '0.69rem', color: '#8a9ab0', marginTop: '0.2rem' }}>UN: {result.sanctionsUN} · US: {result.sanctionsUS} · EU: {result.sanctionsEU}</div>}
            </div>
            {result.nationalisationRisk && (
              <div style={{ background: ['Very High', 'High'].includes(result.nationalisationRisk) ? '#fdf0f0' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#fef9ec' : '#f0faf5', border: `1px solid ${['Very High', 'High'].includes(result.nationalisationRisk) ? '#f5c6c6' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#f5e6b2' : '#b8e0cc'}`, borderRadius: 6, padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: ['Very High', 'High'].includes(result.nationalisationRisk) ? '#c0392b' : ['Medium-High', 'Medium'].includes(result.nationalisationRisk) ? '#b07d1a' : '#2e7d52', marginBottom: '0.2rem' }}>
                  {['Very High', 'High'].includes(result.nationalisationRisk) ? '⚠' : ['Low', 'Very Low'].includes(result.nationalisationRisk) ? '✓' : '~'} Nationalisation risk: {result.nationalisationRisk}
                </div>
                <div style={{ fontSize: '0.71rem', color: '#4a5568', lineHeight: 1.5 }}>{result.nationalisationNotes ? result.nationalisationNotes.substring(0, 160) + (result.nationalisationNotes.length > 160 ? '…' : '') : ''}</div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'regions' && <SubnationalPanel countryName={result.name} weights={weights} />}
      {tab === 'research' && <ResearchAssistant countryName={result.name} />}
      {tab === 'leadership' && <LeadershipSentiment countryName={result.name} />}

      {tab === 'action' && (
        <div>
          {intel ? (
            <>
              <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 13px', marginBottom: '1rem', fontSize: '0.82rem', color: '#3d5a99', lineHeight: 1.5 }}>
                Ministry routing for: <strong style={{ color: '#1a2035' }}>{TYPE_LABEL[profile.answers.investorType] || 'Investor'}{profile.answers.sectorFocus ? ` · ${SECTOR_LABEL[profile.answers.sectorFocus]}` : ''}</strong>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Recommended ministries</div>
              {relevantMinistries.map(m => (
                <div key={m.name} style={{ border: '1px solid #e2e6ea', borderRadius: 8, padding: '10px 13px', marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d7be8', textDecoration: 'none' }}>{m.name} ↗</a>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 5px' }}>{m.description}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, fontWeight: 600, flexShrink: 0, background: m.priority === 1 ? '#f0faf5' : m.priority === 2 ? '#fef9ec' : '#f1f3f5', color: m.priority === 1 ? '#2e7d52' : m.priority === 2 ? '#b07d1a' : '#6b7280' }}>
                      {m.priority === 1 ? 'Priority 1' : m.priority === 2 ? 'Priority 2' : 'Contextual'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #3d7be8', paddingLeft: 8, lineHeight: 1.6, borderRadius: 0 }}>{m.outreachNote}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>AI outreach strategy</div>
              <OutreachStrategy iso={result.iso} countryName={result.name} profile={profile} />
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Intelligence layer</div>
              <LiveScan iso={result.iso} countryName={result.name} />
              <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3d7be8', display: 'inline-block' }} />Curated research layer</div>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0' }}>Updated monthly</span>
                </div>
                <div style={{ padding: '11px 13px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>Analyst-verified data and academic citations — reviewed each month by the research team</div>
                  {[
                    ['Judicial independence', intel.judicialScore, 'High confidence'],
                    ['Fastest approval', `${[...intel.approvalTimelines].sort((a,b)=>a.months-b.months)[0]?.sector}: ${[...intel.approvalTimelines].sort((a,b)=>a.months-b.months)[0]?.timeline}`, 'Verify quarterly'],
                    ['Power status', intel.loadsheddingNote.slice(0, 55), 'Monitor monthly'],
                  ].map(([label, val, conf]) => (
                    <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, fontSize: '0.78rem' }}>
                      <div style={{ color: '#8a9ab0', width: 140, flexShrink: 0 }}>{label}</div>
                      <div style={{ flex: 1 }}>{val} <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 20, background: conf === 'High confidence' ? '#f0faf5' : '#fef9ec', color: conf === 'High confidence' ? '#2e7d52' : '#b07d1a' }}>{conf}</span></div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.78rem' }}>
                    <div style={{ color: '#8a9ab0', width: 140, flexShrink: 0 }}>Academic note</div>
                    <div style={{ flex: 1, color: '#6b7280', lineHeight: 1.5 }}>{intel.loadshedding ? 'Power reliability is a causal FDI driver in SSA (Asiedu 2024). Infrastructure pillar weighted accordingly.' : "This country's infrastructure advantage is a positive FDI differentiator vs regional peers (Asiedu 2024)."}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8a9ab0', fontSize: '0.82rem', background: '#f8f9fb', borderRadius: 8 }}>Ministry routing not yet available for {result.name}. Coming soon.</div>
          )}
        </div>
      )}

      {tab === 'hedge' && (
        <div>
          {intel ? (
            <>
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, border: '1px solid #e2e6ea' }}>
                Complementary markets to reduce concentration risk in <strong style={{ color: '#1a2035' }}>{result.name}</strong>. Click any country name to explore it.
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Country-level hedges</div>
              {intel.hedges.map(h => {
                const hr = allResults.find(r => r.iso === h.iso);
                return (
                  <div key={h.iso} style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                      <div>
                        <button onClick={() => onNavigateTo(h.iso)} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3d7be8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>{h.countryName} →</button>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1 }}>{h.type}</div>
                        {hr && <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: 2 }}>Score: {hr.customScore}/100 · Rank #{hr.customRank}</div>}
                      </div>
                      <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, background: '#f0faf5', color: '#2e7d52', fontWeight: 600 }}>Recommended</span>
                    </div>
                    <div style={{ marginBottom: 7 }}>{h.tags.map(t => <span key={t} style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 20, background: '#f0faf5', color: '#2e7d52', border: '1px solid #b8e0cc', marginRight: 4 }}>{t}</span>)}</div>
                    <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                      <strong style={{ color: '#1a2035' }}>Why it hedges {result.name}:</strong> {h.reasoning}
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Within-country sector hedge</div>
              {(() => {
                const fastest = [...intel.approvalTimelines].sort((a, b) => a.months - b.months)[0];
                const sectorLabel = SECTOR_LABEL[sector] || sector;
                return (
                  <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2035', marginBottom: 6 }}>Pair {sectorLabel.toLowerCase()} with a lower-friction sector anchor</div>
                    <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                      The fastest approval pathway in {result.name} is currently <strong style={{ color: '#1a2035' }}>{fastest?.sector}</strong> at <strong style={{ color: '#1a2035' }}>{fastest?.timeline}</strong>. A position in that sector can serve as a lower-risk, quicker-entry anchor while a longer-approval sector play matures alongside it.
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8a9ab0', fontSize: '0.82rem', background: '#f8f9fb', borderRadius: 8 }}>Hedge recommendations not yet available for {result.name}. Coming soon.</div>
          )}
        </div>
      )}
    </div>
  );
}
