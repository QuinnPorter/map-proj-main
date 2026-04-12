import { useState, useEffect } from 'react';
import { EVIDENCE } from '../data/evidenceData';

interface Message { role: 'user' | 'assistant'; content: string; }
interface FeedItem { title: string; source: string; published: string; link: string; takeaway: string; relevance: number; }

const SUGGESTED = [
  'What does recent literature say about FDI determinants here?',
  'How does corruption affect investment in this market?',
  'What are the key infrastructure challenges for investors?',
  'What recent governance reforms are relevant?',
  'How does political uncertainty affect investment decisions?',
];

interface Props { countryName?: string; pillarName?: string; }

function buildStaticFeed(countryName?: string): FeedItem[] {
  return EVIDENCE.slice(0, 5).map((entry, idx) => ({
    title: `${entry.pillarId.toUpperCase()}: ${entry.summary}`,
    source: `${entry.citations[0]?.journal ?? 'Research brief'} (${countryName ?? 'Africa'})`,
    published: `${entry.citations[0]?.year ?? 2026}-01-01`,
    link: entry.citations[0]?.url ?? '',
    takeaway: entry.keyInsight,
    relevance: Math.max(5, 9 - idx),
  }));
}

function generateStaticResearchReply(question: string, countryName?: string, pillarName?: string): string {
  const q = question.toLowerCase();
  const scope = countryName ?? 'African markets';
  const pillarEvidence = pillarName
    ? EVIDENCE.find((e) => e.pillarId.toLowerCase() === pillarName.toLowerCase())
    : undefined;
  const top = pillarEvidence ?? EVIDENCE.find((e) =>
    q.includes(e.pillarId.toLowerCase()) || q.includes(e.summary.toLowerCase().split(' ')[0].toLowerCase()),
  ) ?? EVIDENCE[0];
  const citations = top.citations.slice(0, 2).map((c) => `${c.authors} (${c.year})`).join('; ');
  return [
    `Static research brief for ${scope}:`,
    top.keyInsight,
    `Evidence confidence: ${top.confidence}.`,
    `Representative sources: ${citations}.`,
    'Note: this GitHub Pages build uses an in-browser evidence database and does not call a backend API.',
  ].join('\n');
}

export default function ResearchAssistant({ countryName, pillarName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'feed'>('chat');

  // Load live feed when country is provided
  useEffect(() => {
    if (!countryName) {
      setFeedItems([]);
      return;
    }
    setFeedLoading(true);
    const timer = setTimeout(() => {
      setFeedItems(buildStaticFeed(countryName));
      setFeedLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [countryName]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const reply = generateStaticResearchReply(text, countryName, pillarName);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 200);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ background: '#eef2ff', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid #c7d7f8' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d7be8', marginBottom: '0.2rem' }}>📚 Research Assistant</div>
        <div style={{ fontSize: '0.74rem', color: '#4a5568', lineHeight: 1.5 }}>
          Ask about academic literature and investment evidence{countryName ? ` for ${countryName}` : ''}. 
          {countryName && ' Also shows latest research briefs from bundled in-app data.'}
        </div>
      </div>

      {/* View toggle */}
      {countryName && (
        <div style={{ display: 'flex', background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 6, padding: 3, width: 'fit-content' }}>
          {([{ key: 'chat', label: '💬 Ask a question' }, { key: 'feed', label: '🔄 Latest papers' }] as const).map(v => (
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
      )}

      {/* Live feed view */}
      {activeView === 'feed' && countryName && (
        <div>
          {feedLoading && <div style={{ fontSize: '0.78rem', color: '#8a9ab0', padding: '0.5rem 0' }}>Loading research briefs…</div>}
          {!feedLoading && feedItems.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#8a9ab0' }}>No recent papers found. Try the chat to ask about research.</div>
          )}
          {feedItems.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a2035', flex: 1, marginRight: '0.5rem' }}>{item.title}</div>
                <span style={{
                  fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap',
                  background: item.relevance >= 7 ? '#f0faf5' : '#f8f9fb',
                  color: item.relevance >= 7 ? '#2e7d52' : '#8a9ab0',
                  border: `1px solid ${item.relevance >= 7 ? '#b8e0cc' : '#e2e6ea'}`,
                }}>
                  {item.relevance}/10 relevance
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8a9ab0', marginBottom: '0.35rem' }}>
                {item.source} · {item.published?.substring(0, 10)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#4a5568', lineHeight: 1.5, marginBottom: '0.35rem' }}>{item.takeaway}</div>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3d7be8' }}>
                  Read paper →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat view */}
      {activeView === 'chat' && (
        <>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#8a9ab0', marginBottom: '0.2rem', fontWeight: 600 }}>Suggested questions:</div>
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.replace('here', countryName ?? 'Africa').replace('this market', countryName ?? 'African markets'))} style={{
                  background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 6,
                  padding: '0.48rem 0.75rem', fontSize: '0.76rem', color: '#1a2035',
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                }}>{q.replace('here', countryName ?? 'Africa').replace('this market', countryName ?? 'African markets')}</button>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  background: m.role === 'user' ? '#eef2ff' : '#fff',
                  border: `1px solid ${m.role === 'user' ? '#c7d7f8' : '#e2e6ea'}`,
                  borderRadius: 8, padding: '0.6rem 0.8rem',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: m.role === 'user' ? '#3d7be8' : '#8a9ab0', marginBottom: '0.2rem' }}>
                    {m.role === 'user' ? 'You' : '📚 Research Assistant'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1a2035', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              ))}
              {loading && <div style={{ background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: '0.76rem', color: '#8a9ab0' }}>Searching literature…</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask about investment evidence…" disabled={loading}
              style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #e2e6ea', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1a2035' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
              padding: '0.55rem 1rem', background: '#3d7be8', border: 'none', borderRadius: 6,
              color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1,
            }}>Send</button>
          </div>

          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{ background: 'none', border: 'none', color: '#c0c8d4', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', padding: 0 }}>
              Clear conversation
            </button>
          )}
        </>
      )}
    </div>
  );
}
