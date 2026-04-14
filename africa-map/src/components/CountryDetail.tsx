import { useState } from 'react';
import type { CountryResult, PillarWeights, InvestorProfile } from '../types';
import { PILLARS } from '../scoring/engine';
import { EVIDENCE } from '../data/evidenceData';
import SubnationalPanel from './SubnationalPanel';
import ResearchAssistant from './ResearchAssistant';
import LeadershipSentiment from './LeadershipSentiment';
import { getIntelligence, getRelevantMinistries } from '../data/countryIntelligence';

type Tab = 'overview' | 'regions' | 'research' | 'leadership' | 'action' | 'hedge';

interface Props {
  result: CountryResult;
  profile: InvestorProfile;
  allResults: CountryResult[];
  weights: PillarWeights;
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
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          messages: [{ role: 'user', content: `You are an Africa investment intelligence tool. Based on your knowledge of ${countryName} investment climate as of early 2025, provide a brief intelligence briefing.\n\nReturn ONLY this JSON, no markdown fences:\n{"headline":"One sentence on dominant investment signal","sentiment":72,"signals":[{"ministry":"Ministry name","signal":"One sentence","tone":"positive"},{"ministry":"Second ministry","signal":"One sentence","tone":"mixed"}],"watchlist":"One development to monitor 3–6 months"}\n\nReplace placeholders. sentiment 0–100. tone: positive, mixed, or negative.` }],
        }),
      });
      const d = await r.json();
      const parsed = JSON.parse((d.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim());
      setResult(parsed); setState('done');
    } catch { setState('error'); }
  }

  const toneStyle = (t: string) => t === 'positive'
    ? { bg: '#e8f5e9', color: '#2e7d52' } : t === 'mixed'
    ? { bg: '#fff8e1', color: '#b07d1a' }
    : { bg: '#ffebee', color: '#c0392b' };

  return (
    <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2035' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginRight: 6 }} />
          Live AI scan
        </span>
        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#f1f3f5', color: '#6b7280' }}>On demand</span>
      </div>
      <div style={{ padding: '11px 13px' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8 }}>AI analysis of recent ministerial statements for {countryName}</div>
        {state === 'idle' && <button onClick={runScan} style={{ padding: '7px 13px', border: '1px solid #3d7be8', borderRadius: 6, background: 'transparent', color: '#3d7be8', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Scan latest ministry signals →</button>}
        {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Scanning…</div>}
        {state === 'error' && <span style={{ fontSize: '0.78rem', color: '#c0392b' }}>Unavailable. <button onClick={runScan} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></span>}
        {state === 'done' && result && <>
          <div style={{ fontSize: '0.82rem', color: '#1a2035', marginBottom: 7, lineHeight: 1.5 }}>{result.headline}</div>
          <div style={{ height: 5, background: '#e2e6ea', borderRadius: 3, marginBottom: 3, overflow: 'hidden' }}><div style={{ height: '100%', background: '#22c55e', width: `${Math.min(Math.max(result.sentiment, 0), 100)}%`, borderRadius: 3 }} /></div>
          <div style={{ fontSize: '0.68rem', color: '#166534', marginBottom: 10 }}>{result.sentiment}% positive sentiment</div>
          {result.signals.map((s, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2035', marginBottom: 2 }}>
                {s.ministry} <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: 20, ...toneStyle(s.tone) }}>{s.tone}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{s.signal}</div>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #f59e0b', paddingLeft: 7, lineHeight: 1.5 }}><strong style={{ color: '#1a2035' }}>Watch:</strong> {result.watchlist}</div>
          <button onClick={runScan} style={{ marginTop: 8, padding: '5px 10px', border: '1px solid #e2e6ea', borderRadius: 6, background: 'transparent', color: '#6b7280', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Refresh scan</button>
        </>}
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
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 600,
          messages: [{ role: 'user', content: `Africa investment advisory. Generate outreach strategy for ${countryName}.\nInvestor: ${TYPE_LABEL[profile.answers.investorType] || 'investor'}, ${SECTOR_LABEL[profile.answers.sectorFocus] || 'diversified'}.\nGovt priorities: ${intel?.governmentPriorities.join(', ') || ''}.\nMinistries: ${intel?.ministries.map(m => m.name).join('; ') || ''}.\n\nReturn ONLY JSON, no markdown:\n{"priorities":"2 sentences on what this govt most wants","messages":["Message 1","Message 2","Message 3"],"avoid":"One framing to avoid","timing":"One sentence on current timing"}` }],
        }),
      });
      const d = await r.json();
      const parsed = JSON.parse((d.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim());
      setResult(parsed); setState('done');
    } catch { setState('error'); }
  }

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>Generate tailored outreach language based on government priorities and your investor profile.</div>
      {state === 'idle' && <button onClick={generate} style={{ padding: '8px 14px', background: '#3d7be8', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Generate outreach strategy →</button>}
      {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Generating…</div>}
      {state === 'error' && <span style={{ fontSize: '0.78rem', color: '#c0392b' }}>Failed. <button onClick={generate} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></span>}
      {state === 'done' && result && (
        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e6ea' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Government priorities right now</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>{result.priorities}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Lead with these messages</div>
          {result.messages.map((m, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5 }}><span style={{ color: '#3d7be8', fontWeight: 700, flexShrink: 0, fontSize: '0.78rem' }}>{i + 1}.</span><span style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{m}</span></div>)}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', margin: '8px 0 4px' }}>Avoid in initial outreach</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>{result.avoid}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Timing</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{result.timing}</div>
          <button onClick={generate} style={{ marginTop: 10, padding: '5px 10px', border: '1px solid #e2e6ea', borderRadius: 6, background: 'transparent', color: '#6b7280', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate</button>
        </div>
      )}
    </div>
  );
}

export default function CountryDetail({ result, profile, allResults, weights, onBack, onNavigateTo }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [activeEvidencePillar, setActiveEvidencePillar] = useState<string | null>(null);

  const intel = getIntelligence(result.iso);
  const sector = profile.answers.sectorFocus || 'diversified';
  const relevantMinistries = intel ? getRelevantMinistries(result.iso, sector) : [];
  const score = result.customScore || result.defaultScore;
  const colors = SCORE_BG(score);
  const pendingPillars = result.pillars.filter(p => p.score < 0);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: '🌍 Overview' },
    { key: 'regions', label: '📍 Regions' },
    { key: 'research', label: '📚 Research' },
    { key: 'leadership', label: '🎙️ Leadership' },
    { key: 'action', label: '🎯 Take action' },
    { key: 'hedge', label: '🔀 Hedge' },
  ];

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e6ea', borderRadius: 6, color: '#6b7280', padding: '5px 10px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Rankings</button>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2035' }}>{result.name}</div>
        <div style={{ marginLeft: 'auto' }}>
          {score > 0 && <div style={{ textAlign: 'center', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '4px 10px', display: 'inline-block' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.text }}>{score}</span>
            <span style={{ fontSize: '0.65rem', color: '#8a9ab0' }}>/100 · #{result.customRank || result.defaultRank}</span>
          </div>}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#8a9ab0', marginBottom: '0.9rem' }}>{result.economicCommunity} · Pop. {result.population}</div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e6ea', marginBottom: '1rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 12px', fontSize: '0.78rem', cursor: 'pointer',
            border: 'none', borderBottom: `2px solid ${tab === t.key ? '#3d7be8' : 'transparent'}`,
            background: 'none', color: tab === t.key ? '#3d7be8' : '#8a9ab0',
            fontWeight: tab === t.key ? 700 : 400, fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview (original Country tab) ── */}
      {tab === 'overview' && <>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.6rem' }}>
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
      </>}

      {tab === 'regions' && <SubnationalPanel countryName={result.name} weights={weights} />}
      {tab === 'research' && <ResearchAssistant countryName={result.name} />}
      {tab === 'leadership' && <LeadershipSentiment countryName={result.name} />}

      {/* ── Take action tab ── */}
      {tab === 'action' && <div>
        <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 13px', marginBottom: '1rem', fontSize: '0.82rem', color: '#3d5a99', lineHeight: 1.5 }}>
          Ministry routing for: <strong style={{ color: '#1a2035' }}>{TYPE_LABEL[profile.answers.investorType] || 'Investor'}{profile.answers.sectorFocus ? ` · ${SECTOR_LABEL[profile.answers.sectorFocus]}` : ''}</strong>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommended ministries</div>
        {relevantMinistries.length > 0 ? relevantMinistries.map(m => (
          <div key={m.name} style={{ border: '1px solid #e2e6ea', borderRadius: 8, padding: '10px 13px', marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d7be8', textDecoration: 'none' }}>{m.name} ↗</a>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 5px' }}>{m.description}</div>
              </div>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: m.priority === 1 ? '#e8f5e9' : m.priority === 2 ? '#fff8e1' : '#f1f3f5', color: m.priority === 1 ? '#2e7d52' : m.priority === 2 ? '#b07d1a' : '#6b7280', fontWeight: 500, flexShrink: 0 }}>
                {m.priority === 1 ? 'Priority 1' : m.priority === 2 ? 'Priority 2' : 'Contextual'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #3d7be8', paddingLeft: 8, lineHeight: 1.6 }}>{m.outreachNote}</div>
          </div>
        )) : (
          <div style={{ fontSize: '0.82rem', color: '#8a9ab0', background: '#f8f9fb', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            Ministry routing data not yet available for this country.
          </div>
        )}
        <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
        <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI outreach strategy</div>
        <OutreachStrategy iso={result.iso} countryName={result.name} profile={profile} />
        <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
        <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intelligence layer</div>
        <LiveScan iso={result.iso} countryName={result.name} />
        {intel && (
          <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2035' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3d7be8', display: 'inline-block', marginRight: 6 }} />Curated research layer</span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0' }}>Updated monthly</span>
            </div>
            <div style={{ padding: '11px 13px' }}>
              {[
                ['Judicial independence', `${intel.judicialScore}`, true],
                ['Fastest approval', `${intel.approvalTimelines[0]?.sector}: ${intel.approvalTimelines[0]?.timeline}`, false],
                ['Education index', `${intel.educationIndex} · HDI 2024`, true],
                ['Power status', intel.loadsheddingNote.slice(0, 60), false],
              ].map(([label, value, high]) => (
                <div key={String(label)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: '0.78rem' }}>
                  <div style={{ color: '#8a9ab0', width: 140, flexShrink: 0 }}>{label}</div>
                  <div>{value} <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: 20, background: high ? '#e8f5e9' : '#fff8e1', color: high ? '#2e7d52' : '#b07d1a' }}>{high ? 'High confidence' : 'Verify quarterly'}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>}

      {/* ── Hedge tab ── */}
      {tab === 'hedge' && <div>
        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, border: '1px solid #e2e6ea' }}>
          Complementary markets to reduce concentration risk in <strong style={{ color: '#1a2035' }}>{result.name}</strong>. Click any country to explore it.
        </div>
        {intel?.hedges && intel.hedges.length > 0 ? <>
          <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country-level hedges</div>
          {intel.hedges.map(h => {
            const hr = allResults.find(r => r.iso === h.iso);
            return (
              <div key={h.iso} style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                  <div>
                    <button onClick={() => onNavigateTo(h.iso)} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3d7be8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>{h.countryName} →</button>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1 }}>{h.type}</div>
                    {hr && <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: 2 }}>Score: {hr.customScore || hr.defaultScore}/100 · Rank #{hr.customRank || hr.defaultRank}</div>}
                  </div>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#e8f5e9', color: '#2e7d52', fontWeight: 500 }}>Recommended</span>
                </div>
                <div style={{ marginBottom: 7 }}>{h.tags.map(t => <span key={t} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: '#e8f5e9', color: '#2e7d52', margin: '2px 2px 0 0', display: 'inline-block' }}>{t}</span>)}</div>
                <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}><strong style={{ color: '#1a2035' }}>Why it hedges {result.name}:</strong> {h.reasoning}</div>
              </div>
            );
          })}
        </> : (
          <div style={{ fontSize: '0.82rem', color: '#8a9ab0', background: '#f8f9fb', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>Hedge recommendations for this country are being researched and will appear here soon.</div>
        )}
        {intel && (() => {
          const fastest = [...intel.approvalTimelines].sort((a, b) => a.months - b.months)[0];
          return (
            <div>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
              <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Within-country sector hedge</div>
              <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2035', marginBottom: 6 }}>Pair {SECTOR_LABEL[sector]?.toLowerCase() || sector} with a lower-friction anchor</div>
                <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                  <strong style={{ color: '#1a2035' }}>Logic:</strong> The fastest approval pathway in {result.name} is <strong style={{ color: '#1a2035' }}>{fastest?.sector}</strong> at <strong style={{ color: '#1a2035' }}>{fastest?.timeline}</strong>. A position there can serve as a quicker-entry anchor while a longer-approval sector play matures.
                </div>
              </div>
            </div>
          );
        })()}
      </div>}
    </div>
  );
}
