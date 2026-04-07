interface Props {
  onStart: () => void;
}

export default function Landing({ onStart }: Props) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117', color: '#e8ecf0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem', textAlign: 'center',
    }}>

      {/* Badge */}
      <div style={{
        fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em',
        color: '#3d7be8', textTransform: 'uppercase', marginBottom: '1.25rem',
        padding: '0.3rem 0.8rem', border: '1px solid #1e3a6e', borderRadius: 100,
        background: '#0d1f3c',
      }}>
        Africa Investability Intelligence
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800,
        lineHeight: 1.2, maxWidth: 560, margin: '0 0 1rem',
        color: '#e8ecf0',
      }}>
        Which African markets fit{' '}
        <span style={{ color: '#3d7be8' }}>your strategy</span>?
      </h1>

      <p style={{
        fontSize: '1rem', color: '#6b7280', maxWidth: 480,
        lineHeight: 1.65, margin: '0 0 2rem',
      }}>
        Generic country rankings tell you what the average observer thinks.
        We show you which markets are most investable for your specific
        priorities, constraints, and risk tolerance.
      </p>

      {/* Features */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: '2.5rem',
      }}>
        {[
          { icon: '🎯', text: 'Investor-specific rankings' },
          { icon: '🔬', text: 'Research-backed methodology' },
          { icon: '🌍', text: '54 African markets' },
          { icon: '⚙️', text: 'Hard filters + custom weights' },
        ].map(f => (
          <div key={f.text} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: '#161c27', border: '1px solid #2a3245',
            borderRadius: 8, padding: '0.5rem 0.85rem',
            fontSize: '0.82rem', color: '#a0aec0',
          }}>
            <span>{f.icon}</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        style={{
          padding: '0.85rem 2.25rem', background: '#3d7be8',
          border: 'none', borderRadius: 8, color: '#fff',
          fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.01em',
          boxShadow: '0 4px 20px rgba(61,123,232,0.35)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(61,123,232,0.45)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.transform = '';
          (e.target as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(61,123,232,0.35)';
        }}
      >
        Build my investor profile →
      </button>

      <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#4a5568' }}>
        ~2 minutes · 12 questions
      </p>

      {/* Pillars preview */}
      <div style={{
        marginTop: '3rem', maxWidth: 560,
        background: '#161c27', border: '1px solid #2a3245',
        borderRadius: 10, padding: '1.25rem',
        textAlign: 'left',
      }}>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          7 investability pillars
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {[
            'Political & Policy Stability', 'Rule of Law & Property Rights',
            'FX & Capital Mobility', 'Macroeconomic Stability',
            'Market Depth & Exitability', 'Infrastructure & Operating Env.',
            'Growth Opportunity',
          ].map(p => (
            <span key={p} style={{
              background: '#1e2535', border: '1px solid #2a3245',
              borderRadius: 4, padding: '0.25rem 0.6rem',
              fontSize: '0.75rem', color: '#a0aec0',
            }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
