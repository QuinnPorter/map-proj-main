interface Props {
  onStart: () => void;
}

export default function Landing({ onStart }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0f4ff 0%, #fff 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem',
    }}>

      {/* Nav bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e6ea', padding: '0.85rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3d7be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.9rem' }}>AfriInvest Intelligence</span>
        </div>
        <button onClick={onStart} style={{
          padding: '0.45rem 1.1rem', background: '#3d7be8', border: 'none',
          borderRadius: 6, color: '#fff', fontSize: '0.82rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Build your profile →
        </button>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 620, textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{
          display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.12em', color: '#3d7be8', textTransform: 'uppercase',
          padding: '0.3rem 0.9rem', border: '1px solid #c7d7f8',
          borderRadius: 100, background: '#eef2ff', marginBottom: '1.5rem',
        }}>
          Research-backed · Investor-specific · 54 African markets
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 800,
          lineHeight: 1.15, color: '#1a2035', margin: '0 0 1.1rem',
          letterSpacing: '-0.02em',
        }}>
          Which African markets fit{' '}
          <span style={{
            background: 'linear-gradient(135deg, #3d7be8, #6b4fcc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>your strategy</span>?
        </h1>

        <p style={{
          fontSize: '1.05rem', color: '#4a5568', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 2.25rem',
        }}>
          Generic country rankings tell you what the average observer thinks.
          We show you which markets are most investable for your specific
          priorities, constraints, and risk tolerance — backed by peer-reviewed evidence.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <button onClick={onStart} style={{
            padding: '0.9rem 2.4rem', background: '#3d7be8', border: 'none',
            borderRadius: 8, color: '#fff', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(61,123,232,0.3)',
          }}>
            Build my investor profile
          </button>
          <button onClick={onStart} style={{
            padding: '0.9rem 1.6rem', background: '#fff',
            border: '1px solid #e2e6ea', borderRadius: 8, color: '#1a2035',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            View default rankings
          </button>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#a0aec0' }}>~3 minutes · 21 questions · No sign-up required</p>
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem', maxWidth: 820, width: '100%', marginTop: '3rem',
      }}>
        {[
          { icon: '🎯', title: 'Investor-specific rankings', desc: 'Custom scores based on your priorities, constraints, and sector focus' },
          { icon: '🔬', title: 'Research-backed', desc: 'Every pillar grounded in peer-reviewed literature from AJPS, The World Economy, and more' },
          { icon: '📍', title: 'Subnational drill-down', desc: '601 regions across 34 countries ranked by your investor profile' },
          { icon: '🎙️', title: 'Leadership sentiment', desc: 'AI analysis of how national and regional leaders talk about investment' },
          { icon: '📚', title: 'Research assistant', desc: 'Ask questions about investment evidence for any country' },
          { icon: '🌐', title: 'Scenario analysis', desc: 'Test rankings under election cycles, FX stress, commodity shocks, and more' },
        ].map(f => (
          <div key={f.title} style={{
            background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10,
            padding: '1rem 1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{f.title}</div>
            <div style={{ fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Pillars */}
      <div style={{
        maxWidth: 620, width: '100%', marginTop: '2rem',
        background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10,
        padding: '1.1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
              background: '#f8f9fb', border: '1px solid #e2e6ea', borderRadius: 4,
              padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: '#4a5568',
            }}>{p}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.72rem', color: '#c0c8d4', textAlign: 'center' }}>
        Data sources: V-Dem · World Bank WGI · Transparency International · Freedom House · Numbeo · UNCTAD · AfDB
      </div>
    </div>
  );
}
