import { useState } from 'react';

interface Props {
  countryName?: string;
  onScoreGenerated?: (score: LeadershipSentimentScore) => void;
}

export interface LeadershipSentimentScore {
  countryName: string;
  investmentFriendliness: number;  // 0-100
  emotionalRegister: string;
  keyPhrases: string[];
  commitments: string[];
  redFlags: string[];
  summary: string;
  timestamp: number;
}

const EXAMPLE_SPEECHES = [
  'Paste a speech, press release, or statement from a head of state, minister, or regional governor here...',
];

export default function LeadershipSentiment({ countryName, onScoreGenerated }: Props) {
  const [text, setText] = useState('');
  const [leader, setLeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadershipSentimentScore | null>(null);
  const [incorporateInScore, setIncorporateInScore] = useState(false);

  async function analyse() {
    if (!text.trim() || loading) return;
    setLoading(true);

    const systemPrompt = `You are an expert in political economy and investment climate analysis, specialising in Africa. Your task is to analyse speeches, press releases, and statements from political leaders to assess their investment-friendliness and extract signals relevant to foreign investors.

Analyse the provided text and return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:
{
  "investmentFriendliness": <number 0-100>,
  "emotionalRegister": "<one of: Confident, Cautious, Urgent, Defensive, Conciliatory, Nationalistic, Technocratic, Populist>",
  "keyPhrases": ["<phrase 1>", "<phrase 2>", "<phrase 3>", "<phrase 4>", "<phrase 5>"],
  "commitments": ["<specific commitment made>", ...],
  "redFlags": ["<concern for investors>", ...],
  "summary": "<2-3 sentence plain English summary for an investor>"
}

Score 0-100 where:
0-20 = Highly hostile to foreign investment
20-40 = Sceptical or nationalist framing
40-60 = Neutral / mixed signals
60-80 = Broadly investment-friendly
80-100 = Strongly pro-investment with concrete commitments

Be specific and evidence-based. Extract actual phrases from the text. Identify concrete policy commitments vs vague rhetoric. Note any concerning signals (resource nationalism, expropriation language, anti-foreign sentiment, inconsistency with stated policy).`;

    const userPrompt = `${countryName ? `Country: ${countryName}\n` : ''}${leader ? `Speaker: ${leader}\n` : ''}

Text to analyse:
${text}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') ?? '{}';
      
      // Strip markdown if present
      const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(clean);

      const score: LeadershipSentimentScore = {
        countryName: countryName ?? 'Unknown',
        investmentFriendliness: parsed.investmentFriendliness ?? 50,
        emotionalRegister: parsed.emotionalRegister ?? 'Neutral',
        keyPhrases: parsed.keyPhrases ?? [],
        commitments: parsed.commitments ?? [],
        redFlags: parsed.redFlags ?? [],
        summary: parsed.summary ?? '',
        timestamp: Date.now(),
      };

      setResult(score);
      if (onScoreGenerated) onScoreGenerated(score);
    } catch {
      setResult({
        countryName: countryName ?? 'Unknown',
        investmentFriendliness: 50,
        emotionalRegister: 'Unknown',
        keyPhrases: [],
        commitments: [],
        redFlags: ['Error analysing text — please try again'],
        summary: 'Analysis failed. Please check your input and try again.',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s: number) => {
    if (s >= 70) return '#2e7d52';
    if (s >= 50) return '#b07d1a';
    if (s >= 30) return '#c05020';
    return '#c0392b';
  };

  const scoreLabel = (s: number) => {
    if (s >= 80) return 'Strongly pro-investment';
    if (s >= 60) return 'Broadly investment-friendly';
    if (s >= 40) return 'Mixed / neutral signals';
    if (s >= 20) return 'Sceptical / nationalist framing';
    return 'Hostile to foreign investment';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ background: '#fef9ec', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid #f5e6b2' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#b07d1a', marginBottom: '0.2rem' }}>
          🎙️ Leadership Sentiment Analyser
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.5 }}>
          Paste a speech, statement, or press release from a national or regional leader
          {countryName ? ` in ${countryName}` : ''}. The AI will extract investment signals,
          key phrases, emotional register, and concrete commitments.
        </div>
      </div>

      {/* Speaker input */}
      <input
        value={leader}
        onChange={e => setLeader(e.target.value)}
        placeholder="Speaker name & role (optional, e.g. President Ruto, Kenya)"
        style={{
          padding: '0.6rem 0.8rem', border: '1px solid #e2e6ea',
          borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit',
          outline: 'none', color: '#1a2035', background: '#fff',
        }}
      />

      {/* Text input */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={EXAMPLE_SPEECHES[0]}
        rows={6}
        style={{
          padding: '0.75rem', border: '1px solid #e2e6ea',
          borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit',
          outline: 'none', resize: 'vertical', color: '#1a2035',
          background: '#fff', lineHeight: 1.6,
        }}
      />

      <button
        onClick={analyse}
        disabled={loading || !text.trim()}
        style={{
          padding: '0.7rem', background: '#b07d1a',
          border: 'none', borderRadius: 6, color: '#fff',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', opacity: loading || !text.trim() ? 0.5 : 1,
        }}
      >
        {loading ? 'Analysing…' : 'Analyse leadership signals'}
      </button>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Score */}
          <div style={{
            background: '#fff', border: '1px solid #e2e6ea',
            borderRadius: 10, padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: scoreColor(result.investmentFriendliness), lineHeight: 1 }}>
                  {result.investmentFriendliness}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>/100</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: scoreColor(result.investmentFriendliness) }}>
                  {scoreLabel(result.investmentFriendliness)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4a5568', marginTop: '0.15rem' }}>
                  Emotional register: <strong>{result.emotionalRegister}</strong>
                </div>
              </div>
            </div>
            <div style={{ height: 6, background: '#e2e6ea', borderRadius: 3, marginBottom: '0.75rem' }}>
              <div style={{
                height: '100%', width: `${result.investmentFriendliness}%`,
                background: scoreColor(result.investmentFriendliness), borderRadius: 3,
              }} />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#1a2035', lineHeight: 1.6 }}>
              {result.summary}
            </div>
          </div>

          {/* Key phrases */}
          {result.keyPhrases.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Key phrases
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {result.keyPhrases.map((p, i) => (
                  <span key={i} style={{
                    background: '#eef2ff', border: '1px solid #c7d7f8',
                    borderRadius: 4, padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem', color: '#3d7be8',
                  }}>"{p}"</span>
                ))}
              </div>
            </div>
          )}

          {/* Commitments & red flags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {result.commitments.length > 0 && (
              <div style={{ background: '#f0faf5', border: '1px solid #b8e0cc', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#2e7d52', fontWeight: 600, marginBottom: '0.4rem' }}>
                  ✓ Commitments made
                </div>
                {result.commitments.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#1a2035', marginBottom: '0.25rem' }}>· {c}</div>
                ))}
              </div>
            )}
            {result.redFlags.length > 0 && (
              <div style={{ background: '#fdf0f0', border: '1px solid #f5c6c6', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#c0392b', fontWeight: 600, marginBottom: '0.4rem' }}>
                  ⚠ Red flags
                </div>
                {result.redFlags.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#1a2035', marginBottom: '0.25rem' }}>· {f}</div>
                ))}
              </div>
            )}
          </div>

          {/* Incorporate into score toggle */}
          {onScoreGenerated && (
            <div style={{
              background: '#fff', border: '1px solid #e2e6ea',
              borderRadius: 8, padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a2035' }}>
                  Incorporate into country ranking?
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.1rem' }}>
                  Adds a ±{Math.round(Math.abs(result.investmentFriendliness - 50) * 0.1)} point adjustment to {result.countryName}'s score
                </div>
              </div>
              <button
                onClick={() => setIncorporateInScore(v => !v)}
                style={{
                  padding: '0.4rem 0.9rem',
                  background: incorporateInScore ? '#3d7be8' : '#f1f3f5',
                  border: `1px solid ${incorporateInScore ? '#3d7be8' : '#e2e6ea'}`,
                  borderRadius: 6, color: incorporateInScore ? '#fff' : '#6b7280',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {incorporateInScore ? '✓ Incorporated' : 'Include'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
