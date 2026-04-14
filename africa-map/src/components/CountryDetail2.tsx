import { useState } from 'react';
import type { CountryResult, InvestorProfile } from '../types';
import { PILLARS } from '../scoring/engine';
import { getIntelligence, getRelevantMinistries } from '../data/countryIntelligence';
import SubnationalPanel from './SubnationalPanel';

type Tab = 'overview' | 'intelligence' | 'action' | 'hedge';

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

function Tag({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'blue' | 'amber' | 'red' | 'gray' }) {
  const s: Record<string, React.CSSProperties> = {
    green:  { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
    blue:   { background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' },
    amber:  { background: '#fff8e1', color: '#e65100', border: '1px solid #ffe082' },
    red:    { background: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2' },
    gray:   { background: '#f5f5f5', color: '#616161', border: '1px solid #e0e0e0' },
  };
  return <span style={{ ...s[color], fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 20, fontWeight: 500, display: 'inline-block', margin: '2px 2px 0 0', lineHeight: 1.6 }}>{children}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '1.1rem 0 0.45rem' }}>{children}</div>;
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, fontSize: '0.82rem' }}>
      <div style={{ color: '#8a9ab0', width: 140, flexShrink: 0, paddingTop: 1, lineHeight: 1.4 }}>{label}</div>
      <div style={{ flex: 1, color: '#1a2035', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '9px 11px', border: '1px solid #e2e6ea' }}>
      <div style={{ fontSize: '0.68rem', color: '#8a9ab0', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a2035' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: '#a0aec0', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

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
          messages: [{ role: 'user', content: `You are an Africa investment intelligence tool. Based on your knowledge of ${countryName}'s government communications and investment climate as of early 2025, provide a brief intelligence briefing.\n\nReturn ONLY this JSON, no markdown fences:\n{"headline":"One sentence summarising the dominant investment signal from ${countryName}'s government right now","sentiment":72,"signals":[{"ministry":"Ministry name","signal":"One sentence on their current stance","tone":"positive"},{"ministry":"Second ministry","signal":"One sentence","tone":"mixed"}],"watchlist":"One specific development to monitor over the next 3-6 months"}\n\nReplace all placeholder values. sentiment is 0-100. tone is positive, mixed, or negative.` }],
        }),
      });
      const d = await r.json();
      setResult(JSON.parse((d.content?.[0]?.text || '').replace(/```json|```/g, '').trim()));
      setState('done');
    } catch { setState('error'); }
  }

  const toneColor = (t: string): 'green' | 'amber' | 'red' => t === 'positive' ? 'green' : t === 'mixed' ? 'amber' : 'red';

  return (
    <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Live AI scan
        </div>
        <Tag color="gray">On demand</Tag>
      </div>
      <div style={{ padding: '11px 13px' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>AI analysis of recent ministerial statements and investment signals for {countryName}</div>
        {state === 'idle' && <button onClick={runScan} style={{ padding: '7px 13px', border: '1px solid #3d7be8', borderRadius: 6, background: 'transparent', color: '#3d7be8', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Scan latest ministry signals →</button>}
        {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Scanning…</div>}
        {state === 'error' && <div style={{ fontSize: '0.78rem', color: '#c0392b' }}>Unavailable. <button onClick={runScan} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></div>}
        {state === 'done' && result && (
          <div>
            <div style={{ fontSize: '0.82rem', color: '#1a2035', marginBottom: 7, lineHeight: 1.5 }}>{result.headline}</div>
            <div style={{ height: 5, borderRadius: 3, background: '#e2e6ea', marginBottom: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: '#22c55e', width: `${Math.min(Math.max(result.sentiment, 0), 100)}%` }} />
            </div>
            <div style={{ fontSize: '0.68rem', color: '#166534', marginBottom: 10 }}>{result.sentiment}% positive sentiment</div>
            {result.signals.map((s, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}>{s.ministry} <Tag color={toneColor(s.tone)}>{s.tone}</Tag></div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2, lineHeight: 1.5 }}>{s.signal}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #f59e0b', paddingLeft: 7, lineHeight: 1.5 }}><strong style={{ color: '#1a2035' }}>Watch:</strong> {result.watchlist}</div>
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
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 600,
          messages: [{ role: 'user', content: `You are an Africa investment advisory tool. Generate a concise, practical outreach strategy for approaching ${countryName}'s government.\n\nInvestor: ${TYPE_LABEL[profile.answers.investorType] || 'investor'}, focused on ${SECTOR_LABEL[profile.answers.sectorFocus] || 'diversified'}.\nCountry govt priorities: ${intel?.governmentPriorities.join(', ') || ''}.\nKey ministries: ${intel?.ministries.map(m => m.name).join('; ') || ''}.\n\nReturn ONLY this JSON, no markdown fences:\n{"priorities":"2 sentences on what this government most wants from investors right now","messages":["Concrete lead message 1","Lead message 2","Lead message 3"],"avoid":"One specific framing or topic to avoid in initial outreach","timing":"One sentence on current timing or entry conditions"}` }],
        }),
      });
      const d = await r.json();
      setResult(JSON.parse((d.content?.[0]?.text || '').replace(/```json|```/g, '').trim()));
      setState('done');
    } catch { setState('error'); }
  }

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>Generate tailored outreach language based on current government priorities and your investor profile.</div>
      {state === 'idle' && <button onClick={generate} style={{ padding: '8px 14px', background: '#3d7be8', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Generate outreach strategy →</button>}
      {state === 'loading' && <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #e2e6ea', borderTopColor: '#3d7be8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating…</div>}
      {state === 'error' && <div style={{ fontSize: '0.78rem', color: '#c0392b' }}>Failed. <button onClick={generate} style={{ background: 'none', border: 'none', color: '#3d7be8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>Retry</button></div>}
      {state === 'done' && result && (
        <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e6ea' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Government priorities right now</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>{result.priorities}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2035', marginBottom: 4 }}>Lead with these messages</div>
          <div style={{ marginBottom: 10 }}>{result.messages.map((m, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5 }}><span style={{ color: '#3d7be8', fontWeight: 700, flexShrink: 0, fontSize: '0.78rem' }}>{i + 1}.</span><span style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{m}</span></div>)}</div>
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
  const [tab, setTab] = useState<Tab>('overview');
  const intel = getIntelligence(result.iso);
  const sector = profile.answers.sectorFocus || 'diversified';
  const relevantMinistries = intel ? getRelevantMinistries(result.iso, sector) : [];
  const pendingPillars = result.pillars.filter(p => p.score < 0);

  const scoreBadgeStyle: React.CSSProperties = result.customScore >= 70
    ? { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' }
    : result.customScore >= 55
    ? { background: '#fff8e1', color: '#e65100', border: '1px solid #ffe082' }
    : { background: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2' };

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e6ea', borderRadius: 6, color: '#6b7280', padding: '5px 10px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Rankings</button>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2035' }}>{result.name}</div>
        {result.customScore > 0 && (
          <span style={{ ...scoreBadgeStyle, marginLeft: 'auto', fontSize: '0.78rem', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
            {result.customScore}/100 · Rank #{result.customRank}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#8a9ab0', marginBottom: '0.9rem' }}>
        {result.economicCommunity} · Pop. {result.population}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e6ea', marginBottom: '1rem' }}>
        {(['overview', 'intelligence', 'action', 'hedge'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 14px', fontSize: '0.82rem', cursor: 'pointer',
            border: 'none', borderBottom: `2px solid ${tab === t ? '#3d7be8' : 'transparent'}`,
            background: 'none', color: tab === t ? '#3d7be8' : '#8a9ab0',
            fontWeight: tab === t ? 700 : 400, fontFamily: 'inherit',
          }}>
            {t === 'overview' ? 'Overview' : t === 'intelligence' ? 'Intelligence' : t === 'action' ? 'Take action' : 'Hedge'}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div>
          <SectionLabel>Pillar breakdown</SectionLabel>
          <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '13px 15px', marginBottom: 9 }}>
            {PILLARS.map(pd => {
              const p = result.pillars.find(x => x.id === pd.id);
              if (!p) return null;
              const isPending = p.score < 0;
              return (
                <div key={pd.id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4a5568' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: isPending ? '#a0aec0' : pd.color, fontWeight: 600 }}>{isPending ? 'pending' : `${p.score}/100`}</span>
                  </div>
                  {!isPending && <div style={{ height: 5, background: '#f0f0f0', borderRadius: 3 }}><div style={{ height: '100%', width: `${p.score}%`, background: pd.color, borderRadius: 3, opacity: 0.85 }} /></div>}
                  {!isPending && p.drivers.slice(0, 2).map((d, i) => <div key={i} style={{ fontSize: '0.7rem', color: '#8a9ab0', lineHeight: 1.4, marginTop: 3 }}>· {d}</div>)}
                </div>
              );
            })}
            {pendingPillars.length > 0 && <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginTop: 4 }}>⚠ {pendingPillars.map(p => p.name).join(', ')} — data coming soon</div>}
          </div>

          {(result.topStrengths.length > 0 || result.topConstraints.length > 0) && (
            <>
              <SectionLabel>Profile strengths & constraints</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
                <div style={{ background: '#f0faf5', border: '1px solid #a5d6a7', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2e7d32', marginBottom: 6 }}>Top strengths</div>
                  {result.topStrengths.map((s, i) => <div key={i} style={{ fontSize: '0.75rem', color: '#1a2035', marginBottom: 3 }}>· {s}</div>)}
                </div>
                <div style={{ background: '#fff4ec', border: '1px solid #ffcc80', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e65100', marginBottom: 6 }}>Main constraints</div>
                  {result.topConstraints.map((c, i) => <div key={i} style={{ fontSize: '0.75rem', color: '#1a2035', marginBottom: 3 }}>· {c}</div>)}
                </div>
              </div>
            </>
          )}

          <SectionLabel>Key facts</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7, marginBottom: 9 }}>
            {([['Corporate tax', result.corporateTax], ['VAT', result.vatTax], ['Res. dividend tax', result.resDividendTax], ['Non-res. dividend tax', result.nonResDividendTax], ['Legal system', result.legalSystem], ['Next election', result.nextElection]] as [string, string | undefined][]).map(([label, value]) => (
              <MetricCard key={label} label={label} value={value || '—'} />
            ))}
          </div>

          {(result.gdpPerCapita || result.gdpGrowth || result.inflation) && (
            <>
              <SectionLabel>Macroeconomic indicators</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7, marginBottom: 9 }}>
                {result.gdpPerCapita && <MetricCard label="GDP per capita" value={result.gdpPerCapita} />}
                {result.gdpGrowth && <MetricCard label="GDP growth" value={result.gdpGrowth} />}
                {result.inflation && <MetricCard label="Inflation" value={result.inflation} />}
                {result.debtGdp && <MetricCard label="Debt / GDP" value={result.debtGdp} />}
                {result.fxConvertibility && <MetricCard label="FX regime" value={result.fxConvertibility} />}
              </div>
            </>
          )}

          {intel && (
            <>
              <SectionLabel>People & talent</SectionLabel>
              <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '11px 14px', marginBottom: 9 }}>
                <DataRow label="Education index">{intel.educationIndex} <span style={{ fontSize: '0.7rem', color: '#a0aec0' }}>HDI 2024</span></DataRow>
                <DataRow label="Universities">{intel.universities}</DataRow>
                <DataRow label="Workforce">{intel.workforceProfile}</DataRow>
                <DataRow label="Openness to FDI">{intel.opennessToFDI}</DataRow>
                <DataRow label="Govt priorities">{intel.governmentPriorities.map(p => <Tag key={p} color="green">{p}</Tag>)}</DataRow>
              </div>

              <SectionLabel>Infrastructure</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 7, marginBottom: 9 }}>
                <MetricCard label="Power supply" value={intel.loadshedding ? 'Unreliable' : 'Reliable'} sub={intel.loadsheddingNote.split(';')[0]} />
                <MetricCard label="Utilities" value={intel.utilitiesCost.split(' ')[0]} sub={intel.utilitiesCost} />
                <MetricCard label="Logistics" value={intel.logisticsQuality.split(' — ')[0]} sub={intel.logisticsQuality} />
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '11px 14px', marginBottom: 9 }}>
                <DataRow label="Power / loadshedding"><Tag color={intel.loadshedding ? 'red' : 'green'}>{intel.loadshedding ? 'Present' : 'None'}</Tag><span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: 6 }}>{intel.loadsheddingNote}</span></DataRow>
                <DataRow label="SEZ status">{intel.sezStatus}</DataRow>
                {intel.sezTenants.length > 0 && <DataRow label="Known tenants">{intel.sezTenants.map(t => <Tag key={t} color="blue">{t}</Tag>)}</DataRow>}
              </div>

              <SectionLabel>Approval timelines by sector</SectionLabel>
              <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '11px 14px', marginBottom: 9 }}>
                {intel.approvalTimelines.map(at => (
                  <DataRow key={at.sector} label={at.sector}><Tag color={at.months <= 3 ? 'green' : at.months <= 8 ? 'amber' : 'red'}>{at.timeline}</Tag></DataRow>
                ))}
                <DataRow label="Major projects"><span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{intel.majorProjects.join('; ')}</span></DataRow>
              </div>
            </>
          )}

          {result.excluded && result.exclusionReasons.length > 0 && (
            <>
              <SectionLabel>Excluded by your filters</SectionLabel>
              <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 8, padding: '10px 13px', marginBottom: 9 }}>
                {result.exclusionReasons.map((r, i) => <div key={i} style={{ fontSize: '0.8rem', color: '#b71c1c', marginBottom: 3 }}>· {r}</div>)}
              </div>
            </>
          )}

          <SectionLabel>Subnational regions</SectionLabel>
          <SubnationalPanel countryName={result.name} weights={profile.weights} />
        </div>
      )}

      {/* ── Intelligence ── */}
      {tab === 'intelligence' && (
        <div>
          <LiveScan iso={result.iso} countryName={result.name} />
          <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ padding: '9px 13px', background: '#f8f9fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3d7be8', display: 'inline-block' }} />
                Curated research layer
              </div>
              <Tag color="blue">Updated monthly</Tag>
            </div>
            <div style={{ padding: '11px 13px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>Analyst-verified data and academic citations — reviewed and updated each month</div>
              {intel ? (
                <>
                  <DataRow label="Judicial independence">{intel.judicialScore} <Tag color="green">High confidence</Tag></DataRow>
                  <DataRow label="Fastest approval">{intel.approvalTimelines.sort((a,b)=>a.months-b.months)[0]?.sector}: {intel.approvalTimelines.sort((a,b)=>a.months-b.months)[0]?.timeline} <Tag color="amber">Verify quarterly</Tag></DataRow>
                  <DataRow label="Education index">{intel.educationIndex} · HDI 2024 <Tag color="green">High confidence</Tag></DataRow>
                  <DataRow label="Power status">{intel.loadsheddingNote.slice(0, 70)} <Tag color="amber">Monitor monthly</Tag></DataRow>
                  <DataRow label="Academic note"><span style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{intel.loadshedding ? 'Power reliability confirmed as a causal FDI driver in SSA. Infrastructure pillar weighted accordingly (Asiedu 2024 review).' : 'Infrastructure advantage is a positive FDI differentiator vs regional peers (Asiedu 2024 review).'}</span></DataRow>
                </>
              ) : (
                <div style={{ fontSize: '0.78rem', color: '#8a9ab0' }}>Curated data for {result.name} coming in the next monthly update.</div>
              )}
            </div>
          </div>
          {(result.sanctionsLevel || result.nationalisationRisk) && (
            <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ padding: '9px 13px', background: '#f8f9fb' }}><div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2035' }}>Regulatory risk flags</div></div>
              <div style={{ padding: '11px 13px' }}>
                {result.sanctionsLevel && <DataRow label="Sanctions level">{result.sanctionsLevel}{result.sanctionsNotes ? ` — ${result.sanctionsNotes}` : ''}</DataRow>}
                {result.nationalisationRisk && <DataRow label="Nationalisation risk">{result.nationalisationRisk}{result.nationalisationNotes ? ` — ${result.nationalisationNotes}` : ''}</DataRow>}
                {result.stockExchange && <DataRow label="Stock exchange">{result.stockExchange}</DataRow>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Take action ── */}
      {tab === 'action' && (
        <div>
          <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 13px', marginBottom: '1rem', fontSize: '0.82rem', color: '#3d5a99', lineHeight: 1.5 }}>
            Ministry routing for: <strong style={{ color: '#1a2035' }}>{TYPE_LABEL[profile.answers.investorType] || 'Investor'}{profile.answers.sectorFocus ? ` · ${SECTOR_LABEL[profile.answers.sectorFocus]}` : ''}</strong>
          </div>
          {relevantMinistries.length > 0 ? (
            <>
              <SectionLabel>Recommended ministries</SectionLabel>
              {relevantMinistries.map(m => (
                <div key={m.name} style={{ border: '1px solid #e2e6ea', borderRadius: 8, padding: '10px 13px', marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d7be8', textDecoration: 'none' }}>{m.name} ↗</a>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 5px' }}>{m.description}</div>
                    </div>
                    <Tag color={m.priority === 1 ? 'green' : m.priority === 2 ? 'amber' : 'gray'}>{m.priority === 1 ? 'Priority 1' : m.priority === 2 ? 'Priority 2' : 'Contextual'}</Tag>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', borderLeft: '2px solid #3d7be8', paddingLeft: 8, lineHeight: 1.6 }}>{m.outreachNote}</div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e6ea', marginBottom: 12, fontSize: '0.78rem', color: '#8a9ab0' }}>
              Ministry routing data for {result.name} is being added in the next research update.
            </div>
          )}
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
          <SectionLabel>AI outreach strategy</SectionLabel>
          <OutreachStrategy iso={result.iso} countryName={result.name} profile={profile} />
        </div>
      )}

      {/* ── Hedge ── */}
      {tab === 'hedge' && (
        <div>
          <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, border: '1px solid #e2e6ea' }}>
            Complementary markets to reduce concentration risk in <strong style={{ color: '#1a2035' }}>{result.name}</strong>. Click any country name to explore it.
          </div>
          {intel ? (
            <>
              <SectionLabel>Country-level hedges</SectionLabel>
              {intel.hedges.map(h => {
                const hedgeResult = allResults.find(r => r.iso === h.iso);
                return (
                  <div key={h.iso} style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                      <div>
                        <button onClick={() => onNavigateTo(h.iso)} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3d7be8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>{h.countryName} →</button>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1 }}>{h.type}</div>
                        {hedgeResult && <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: 2 }}>Score: {hedgeResult.customScore}/100 · Rank #{hedgeResult.customRank}</div>}
                      </div>
                      <Tag color="green">Recommended</Tag>
                    </div>
                    <div style={{ marginBottom: 7 }}>{h.tags.map(t => <Tag key={t} color="green">{t}</Tag>)}</div>
                    <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                      <strong style={{ color: '#1a2035' }}>Why it hedges {result.name}:</strong> {h.reasoning}
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
              <SectionLabel>Within-country sector hedge</SectionLabel>
              {(() => {
                const fastest = [...intel.approvalTimelines].sort((a, b) => a.months - b.months)[0];
                return (
                  <div style={{ border: '1px solid #e2e6ea', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2035', marginBottom: 6 }}>Pair {(SECTOR_LABEL[sector] || sector).toLowerCase()} with a lower-friction sector anchor</div>
                    <div style={{ background: '#f8f9fb', borderRadius: 6, padding: '8px 10px', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                      <strong style={{ color: '#1a2035' }}>Logic:</strong> The fastest approval pathway in {result.name} is currently <strong style={{ color: '#1a2035' }}>{fastest?.sector}</strong> at <strong style={{ color: '#1a2035' }}>{fastest?.timeline}</strong>. A position in that sector can serve as a lower-risk, quicker-entry anchor while a longer-approval sector play matures alongside it.
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e6ea', fontSize: '0.78rem', color: '#8a9ab0' }}>
              Hedge recommendations for {result.name} are being added in the next research update.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
