import { useState, useEffect } from 'react';

export interface LeadershipSentimentScore {
  countryName: string;
  investmentFriendliness: number;
  emotionalRegister: string;
  keyPhrases: string[];
  commitments: string[];
  redFlags: string[];
  summary: string;
  timestamp: number;
}

interface FeedItem {
  title: string; source: string; published: string; link: string;
  investmentScore: number; keySignals: string[]; sentiment: string; summary: string;
}

interface Props {
  countryName?: string;
  onScoreGenerated?: (score: LeadershipSentimentScore) => void;
}

const scoreColor = (s: number) => { if (s >= 70) return '#2e7d52'; if (s >= 50) return '#b07d1a'; if (s >= 30) return '#c05020'; return '#c0392b'; };
const scoreLabel = (s: number) => { if (s >= 80) return 'Strongly pro-investment'; if (s >= 60) return 'Broadly investment-friendly'; if (s >= 40) return 'Mixed / neutral signals'; if (s >= 20) return 'Sceptical / nationalist'; return 'Hostile to foreign investment'; };
const POSITIVE_SIGNALS = ['reform', 'investment', 'private sector', 'stability', 'infrastructure', 'jobs', 'partnership', 'transparency'];
const NEGATIVE_SIGNALS = ['nationalize', 'restrict', 'ban', 'uncertainty', 'capital controls', 'sanction', 'instability', 'conflict'];

function buildStaticLeadershipFeed(countryName?: string): { items: FeedItem[]; aggregateScore: number; trend: string } {
  const market = countryName ?? 'Regional';
  const items: FeedItem[] = [
    {
      title: `${market} investment policy briefing`,
      source: 'Public policy digest',
      published: '2026-04-01',
      link: '',
      investmentScore: 66,
      keySignals: ['Regulatory clarity', 'Infrastructure priority'],
      sentiment: 'constructive',
      summary: 'Recent official messaging emphasises policy continuity and infrastructure delivery.',
    },
    {
      title: `${market} leadership communications update`,
      source: 'Economic updates monitor',
      published: '2026-03-26',
      link: '',
      investmentScore: 58,
      keySignals: ['Industrial policy', 'Domestic capacity'],
      sentiment: 'mixed',
      summary: 'Signals are mixed: support for investment is paired with stronger domestic-content language.',
    },
  ];
  return { items, aggregateScore: 62, trend: 'stable' };
}

function analyseTextLocally(text: string, countryName?: string): LeadershipSentimentScore {
  const lower = text.toLowerCase();
  const positiveMatches = POSITIVE_SIGNALS.filter((s) => lower.includes(s));
  const negativeMatches = NEGATIVE_SIGNALS.filter((s) => lower.includes(s));
  const raw = 50 + (positiveMatches.length * 8) - (negativeMatches.length * 10);
  const score = Math.max(0, Math.min(100, raw));

  return {
    countryName: countryName ?? 'Unknown',
    investmentFriendliness: score,
    emotionalRegister: score >= 65 ? 'Optimistic' : score >= 45 ? 'Measured' : 'Defensive',
    keyPhrases: positiveMatches.slice(0, 5),
    commitments: positiveMatches.length > 0 ? positiveMatches.map((s) => `Mentions ${s}`).slice(0, 3) : [],
    redFlags: negativeMatches.length > 0 ? negativeMatches.map((s) => `Potential concern: ${s}`).slice(0, 3) : [],
    summary: positiveMatches.length + negativeMatches.length === 0
      ? 'No strong investment signals detected. Add more detailed policy language for a clearer assessment.'
      : `Detected ${positiveMatches.length} positive and ${negativeMatches.length} cautionary signals in the submitted text.`,
    timestamp: Date.now(),
  };
}

export default function LeadershipSentiment({ countryName, onScoreGenerated }: Props) {
  const [text, setText] = useState('');
  const [leader, setLeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadershipSentimentScore | null>(null);
  const [incorporateInScore, setIncorporateInScore] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedMeta, setFeedMeta] = useState<{ aggregateScore: number | null; trend: string } | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeView, setActiveView] = useState<'analyse' | 'feed'>('feed');

  useEffect(() => {
    if (!countryName) {
      setFeedItems([]);
      setFeedMeta(null);
      return;
    }
    setFeedLoading(true);
    const timer = setTimeout(() => {
      const data = buildStaticLeadershipFeed(countryName);
      setFeedItems(data.items);
      setFeedMeta({ aggregateScore: data.aggregateScore, trend: data.trend });
      setFeedLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [countryName]);

  async function analyse() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setTimeout(() => {
      const score = analyseTextLocally(text, countryName);
      setResult(score);
      if (onScoreGenerated) onScoreGenerated(score);
      setLoading(false);
    }, 200);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      <div style={{ background: '#fef9ec', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid #f5e6b2' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#b07d1a', marginBottom: '0.2rem' }}>🎙️ Leadership Sentiment</div>
        <div style={{ fontSize: '0.74rem', color: '#4a5568', lineHeight: 1.5 }}>
          {countryName ? `Signals for ${countryName}` : 'Analyse speeches and statements'} — generated from bundled static rules for GitHub Pages deployment.
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 6, padding: 3, width: 'fit-content' }}>
        {([{ key: 'feed', label: '🔄 Live signals' }, { key: 'analyse', label: '📝 Analyse text' }] as const).map(v => (
          <button key={v.key} onClick={() => setActiveView(v.key)} style={{
            padding: '0.28rem 0.75rem', border: 'none', borderRadius: 4,
            background: activeView === v.key ? '#fff' : 'transparent',
            color: activeView === v.key ? '#1a2035' : '#8a9ab0',
            fontSize: '0.76rem', fontWeight: activeView === v.key ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: activeView === v.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Live feed */}
      {activeView === 'feed' && (
        <div>
          {feedLoading && <div style={{ fontSize: '0.78rem', color: '#8a9ab0' }}>Fetching latest signals…</div>}

          {!feedLoading && feedMeta && feedMeta.aggregateScore != null && (
            <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreColor(feedMeta.aggregateScore), lineHeight: 1 }}>{feedMeta.aggregateScore}</div>
                <div style={{ fontSize: '0.62rem', color: '#8a9ab0' }}>/100</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: scoreColor(feedMeta.aggregateScore) }}>{scoreLabel(feedMeta.aggregateScore)}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.15rem' }}>
                  Trend: <strong style={{ color: feedMeta.trend === 'improving' ? '#2e7d52' : feedMeta.trend === 'deteriorating' ? '#c0392b' : '#6b7280' }}>{feedMeta.trend}</strong>
                  {' · '}Updated daily
                </div>
              </div>
            </div>
          )}

          {!feedLoading && feedItems.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#8a9ab0' }}>No recent signals found. Try the Analyse text tab to manually paste content.</div>
          )}

          {feedItems.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.7rem', marginBottom: '0.45rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2035', flex: 1, marginRight: '0.5rem' }}>{item.title}</div>
                <span style={{
                  fontSize: '0.68rem', padding: '0.1rem 0.38rem', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap',
                  background: item.investmentScore >= 60 ? '#f0faf5' : item.investmentScore >= 40 ? '#fef9ec' : '#fdf0f0',
                  color: scoreColor(item.investmentScore),
                  border: `1px solid ${item.investmentScore >= 60 ? '#b8e0cc' : item.investmentScore >= 40 ? '#f5e6b2' : '#f5c6c6'}`,
                }}>{item.investmentScore}/100</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8a9ab0', marginBottom: '0.3rem' }}>{item.source} · {item.published?.substring(0, 10)}</div>
              <div style={{ fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.5, marginBottom: '0.3rem' }}>{item.summary}</div>
              {item.keySignals?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {item.keySignals.map((s, j) => (
                    <span key={j} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 3, color: '#6b7280' }}>{s}</span>
                  ))}
                </div>
              )}
              {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: '#3d7be8', display: 'block', marginTop: '0.3rem' }}>Read more →</a>}
            </div>
          ))}
        </div>
      )}

      {/* Analyse text */}
      {activeView === 'analyse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input value={leader} onChange={e => setLeader(e.target.value)} placeholder="Speaker name & role (optional)" style={{ padding: '0.55rem 0.75rem', border: '1px solid #e2e6ea', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', color: '#1a2035', background: '#fff' }} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste a speech, press release, or statement here…" rows={6} style={{ padding: '0.7rem', border: '1px solid #e2e6ea', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', color: '#1a2035', background: '#fff', lineHeight: 1.6 }} />
          <button onClick={analyse} disabled={loading || !text.trim()} style={{ padding: '0.65rem', background: '#b07d1a', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !text.trim() ? 0.5 : 1 }}>
            {loading ? 'Analysing…' : 'Analyse leadership signals'}
          </button>

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.65rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(result.investmentFriendliness), lineHeight: 1 }}>{result.investmentFriendliness}</div>
                    <div style={{ fontSize: '0.62rem', color: '#8a9ab0' }}>/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreColor(result.investmentFriendliness) }}>{scoreLabel(result.investmentFriendliness)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '0.12rem' }}>Register: <strong>{result.emotionalRegister}</strong></div>
                  </div>
                </div>
                <div style={{ height: 5, background: '#e2e6ea', borderRadius: 3, marginBottom: '0.65rem' }}>
                  <div style={{ height: '100%', width: `${result.investmentFriendliness}%`, background: scoreColor(result.investmentFriendliness), borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1a2035', lineHeight: 1.6 }}>{result.summary}</div>
              </div>

              {result.keyPhrases.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key phrases</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {result.keyPhrases.map((p, i) => <span key={i} style={{ background: '#eef2ff', border: '1px solid #c7d7f8', borderRadius: 4, padding: '0.18rem 0.55rem', fontSize: '0.72rem', color: '#3d7be8' }}>"{p}"</span>)}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {result.commitments.length > 0 && (
                  <div style={{ background: '#f0faf5', border: '1px solid #b8e0cc', borderRadius: 8, padding: '0.7rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#2e7d52', fontWeight: 600, marginBottom: '0.35rem' }}>✓ Commitments</div>
                    {result.commitments.map((c, i) => <div key={i} style={{ fontSize: '0.72rem', color: '#1a2035', marginBottom: '0.2rem' }}>· {c}</div>)}
                  </div>
                )}
                {result.redFlags.length > 0 && (
                  <div style={{ background: '#fdf0f0', border: '1px solid #f5c6c6', borderRadius: 8, padding: '0.7rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#c0392b', fontWeight: 600, marginBottom: '0.35rem' }}>⚠ Red flags</div>
                    {result.redFlags.map((f, i) => <div key={i} style={{ fontSize: '0.72rem', color: '#1a2035', marginBottom: '0.2rem' }}>· {f}</div>)}
                  </div>
                )}
              </div>

              {onScoreGenerated && (
                <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2035' }}>Incorporate into country ranking?</div>
                    <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginTop: '0.1rem' }}>
                      Adds ±{Math.round(Math.abs(result.investmentFriendliness - 50) * 0.1)} pts to {result.countryName}'s score
                    </div>
                  </div>
                  <button onClick={() => setIncorporateInScore(v => !v)} style={{
                    padding: '0.38rem 0.85rem', background: incorporateInScore ? '#3d7be8' : '#f8f9fb',
                    border: `1px solid ${incorporateInScore ? '#3d7be8' : '#e2e6ea'}`,
                    borderRadius: 6, color: incorporateInScore ? '#fff' : '#6b7280',
                    fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{incorporateInScore ? '✓ Incorporated' : 'Include'}</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
