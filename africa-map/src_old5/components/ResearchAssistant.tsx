import { useState } from 'react';

interface Props {
  countryName?: string;  // if provided, pre-populates context
  pillarName?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What does recent literature say about FDI determinants in this country?',
  'How does corruption affect investment in this market?',
  'What are the key infrastructure challenges for investors here?',
  'What recent governance reforms are relevant for investors?',
  'How does political uncertainty affect investment decisions in this region?',
];

export default function ResearchAssistant({ countryName, pillarName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const systemPrompt = `You are an expert research assistant specialising in African investment, FDI determinants, and political economy. Your role is to help investors understand the academic and empirical evidence relevant to investment decisions in African markets.

${countryName ? `The user is currently viewing ${countryName} on an Africa investability platform.` : ''}
${pillarName ? `They are specifically interested in the ${pillarName} pillar.` : ''}

Draw on peer-reviewed literature from journals including:
- American Journal of Political Science (AJPS)
- The World Economy
- Journal of African Trade
- African Affairs
- Journal of Modern African Studies
- Global Studies Quarterly
- Journal of Benefit-Cost Analysis
- IMF, World Bank, UNCTAD publications
- V-Dem, Freedom House, Transparency International data

When citing evidence, be specific about authors, years, journals, and findings. Be honest about where evidence is mixed or limited. Connect findings to practical investor implications. Keep responses concise and actionable.`;

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') ?? 'No response.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error connecting to research assistant. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {/* Header */}
      <div style={{
        background: '#eef2ff', borderRadius: 8, padding: '0.75rem 1rem',
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d7be8', marginBottom: '0.2rem' }}>
          📚 Research Assistant
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.5 }}>
          Ask about academic literature, empirical evidence, and investment research
          {countryName ? ` relevant to ${countryName}` : ' across African markets'}.
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.4rem', fontWeight: 600 }}>
            Suggested questions:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.replace('this country', countryName ?? 'Africa').replace('this market', countryName ?? 'African markets').replace('this region', countryName ?? 'Africa'))}
                style={{
                  background: '#f8f9fb', border: '1px solid #e2e6ea',
                  borderRadius: 6, padding: '0.5rem 0.75rem',
                  fontSize: '0.78rem', color: '#1a2035', textAlign: 'left',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
              >
                {q.replace('this country', countryName ?? 'Africa').replace('this market', countryName ?? 'African markets')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message history */}
      {messages.length > 0 && (
        <div style={{
          maxHeight: 380, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
          padding: '0.25rem 0',
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              background: m.role === 'user' ? '#eef2ff' : '#f8f9fb',
              border: `1px solid ${m.role === 'user' ? '#c7d7f8' : '#e2e6ea'}`,
              borderRadius: 8, padding: '0.65rem 0.85rem',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: m.role === 'user' ? '#3d7be8' : '#6b7280', marginBottom: '0.25rem' }}>
                {m.role === 'user' ? 'You' : '📚 Research Assistant'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1a2035', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{
              background: '#f8f9fb', border: '1px solid #e2e6ea',
              borderRadius: 8, padding: '0.65rem 0.85rem',
              fontSize: '0.78rem', color: '#6b7280',
            }}>
              Searching literature…
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about investment evidence…"
          disabled={loading}
          style={{
            flex: 1, padding: '0.6rem 0.8rem',
            border: '1px solid #e2e6ea', borderRadius: 6,
            fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none',
            background: '#fff', color: '#1a2035',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            padding: '0.6rem 1rem', background: '#3d7be8',
            border: 'none', borderRadius: 6, color: '#fff',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => setMessages([])}
          style={{
            background: 'none', border: 'none', color: '#a0aec0',
            fontSize: '0.72rem', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', padding: 0,
          }}
        >
          Clear conversation
        </button>
      )}
    </div>
  );
}
