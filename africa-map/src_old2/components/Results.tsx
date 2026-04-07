import { useState, useMemo } from 'react';
import type { InvestorProfile } from '../types';
import { scoreCountries } from '../scoring/engine';
import { PILLARS } from '../scoring/engine';
import CountryCard from './CountryCard';

interface Props {
  profile: InvestorProfile;
  onReset: () => void;
}

export default function Results({ profile, onReset }: Props) {
  const [showCustom, setShowCustom] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');

  const allResults = useMemo(
    () => scoreCountries(profile.weights, profile.filters),
    [profile]
  );

  const displayed = useMemo(() => {
    let list = [...allResults];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.economicCommunity.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => {
        if (showCustom) {
          if (a.excluded && !b.excluded) return 1;
          if (!a.excluded && b.excluded) return -1;
          return a.customRank - b.customRank;
        }
        return a.defaultRank - b.defaultRank;
      });
    }
    return list;
  }, [allResults, search, sortBy, showCustom]);

  const excluded = allResults.filter(r => r.excluded).length;
  const top3 = allResults
    .filter(r => !r.excluded)
    .sort((a, b) => (showCustom ? a.customRank - b.customRank : a.defaultRank - b.defaultRank))
    .slice(0, 3);

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117', color: '#e8ecf0',
      padding: '1.5rem 1rem',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#e8ecf0' }}>
              Africa Investability Rankings
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
              {profile.label} · {profile.description}
            </p>
          </div>
          <button onClick={onReset} style={{
            background: 'none', border: '1px solid #2a3245', borderRadius: 6,
            color: '#6b7280', padding: '0.4rem 0.9rem', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ← Edit profile
          </button>
        </div>

        {/* Score mode toggle */}
        <div style={{
          display: 'flex', background: '#161c27',
          border: '1px solid #2a3245', borderRadius: 8,
          padding: 4, marginBottom: '1.25rem', width: 'fit-content',
        }}>
          {[
            { key: true, label: 'Your custom ranking' },
            { key: false, label: 'Default ranking' },
          ].map(opt => (
            <button
              key={String(opt.key)}
              onClick={() => setShowCustom(opt.key)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
                background: showCustom === opt.key ? '#3d7be8' : 'transparent',
                color: showCustom === opt.key ? '#fff' : '#6b7280',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >{opt.label}</button>
          ))}
        </div>

        {/* Weight summary */}
        {showCustom && (
          <div style={{
            background: '#161c27', border: '1px solid #2a3245',
            borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your pillar weights
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PILLARS.map(pd => {
                const w = profile.weights[pd.id];
                return (
                  <div key={pd.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: '#1e2535', borderRadius: 4,
                    padding: '0.25rem 0.5rem',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pd.color }} />
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{pd.shortName}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7db4f0' }}>{w}%</span>
                  </div>
                );
              })}
            </div>
            {excluded > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#d0604a' }}>
                {excluded} {excluded === 1 ? 'country' : 'countries'} excluded by your hard filters
              </div>
            )}
          </div>
        )}

        {/* Top 3 spotlight */}
        <div style={{
          background: '#161c27', border: '1px solid #2a3245',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top markets for your profile
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {top3.map((r, i) => (
              <div key={r.name} style={{
                flex: '1 1 140px', background: '#1e2535', borderRadius: 6,
                padding: '0.6rem 0.8rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#3d7be8', fontWeight: 600 }}>#{i + 1}</div>
                <div style={{ fontWeight: 700, color: '#e8ecf0', fontSize: '1rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Score: {showCustom ? r.customScore : r.defaultScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search / sort */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search countries…"
            style={{
              flex: 1, minWidth: 180, padding: '0.5rem 0.75rem',
              background: '#161c27', border: '1px solid #2a3245', borderRadius: 6,
              color: '#e8ecf0', fontSize: '0.85rem', fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'rank' | 'name')}
            style={{
              padding: '0.5rem 0.75rem', background: '#161c27',
              border: '1px solid #2a3245', borderRadius: 6,
              color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="rank">Sort: by rank</option>
            <option value="name">Sort: A–Z</option>
          </select>
        </div>

        {/* Country list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {displayed.map(r => (
            <CountryCard key={r.name} result={r} showCustom={showCustom} />
          ))}
        </div>

        {/* Data note */}
        <div style={{
          marginTop: '2rem', padding: '1rem',
          background: '#161c27', border: '1px solid #2a3245',
          borderRadius: 8, fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#6b7280' }}>Methodology note:</strong> Political stability,
          rule of law, and growth pillars are derived from current national-level data.
          Infrastructure scores use subnational data where available.
          FX/capital mobility, macroeconomic stability, and market depth data are pending
          and excluded from current scoring. Scores will update as data is added.
        </div>
      </div>
    </div>
  );
}
