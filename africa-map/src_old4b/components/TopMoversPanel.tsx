import type { CountryResult, HardFilters, InvestorProfile } from '../types';
import { scoreCountries } from '../scoring/engine';

interface Props {
  results: CountryResult[];
  profile: InvestorProfile;
  showCustom: boolean;
}

export default function TopMoversPanel({ results, profile, showCustom }: Props) {
  if (!showCustom) return null;

  // Top movers (biggest rank improvements under custom vs default)
  const movers = [...results]
    .filter(r => !r.excluded && r.rankChange !== 0)
    .sort((a, b) => b.rankChange - a.rankChange);

  const risers = movers.slice(0, 4);
  const fallers = [...movers].reverse().slice(0, 4);

  // What-if: relax contract enforcement filter
  const whatIfContract = (() => {
    if (!profile.filters.excludeWeakContracts) return null;
    const relaxed = scoreCountries(profile.weights, {
      ...profile.filters,
      excludeWeakContracts: false,
    });
    const newEntrants = relaxed
      .filter(r => !r.excluded)
      .sort((a, b) => a.customRank - b.customRank)
      .slice(0, 10)
      .filter(r => {
        const orig = results.find(x => x.name === r.name);
        return orig?.excluded;
      });
    return newEntrants.slice(0, 3);
  })();

  // What-if: relax political disruption tolerance
  const whatIfPolitical = (() => {
    if (profile.filters.maxPoliticalDisruption === 'high') return null;
    const relaxed = scoreCountries(profile.weights, {
      ...profile.filters,
      maxPoliticalDisruption: 'high',
    });
    const newEntrants = relaxed
      .filter(r => !r.excluded)
      .sort((a, b) => a.customRank - b.customRank)
      .slice(0, 10)
      .filter(r => {
        const orig = results.find(x => x.name === r.name);
        return orig?.excluded;
      });
    return newEntrants.slice(0, 3);
  })();

  // What-if: weight shift — what if growth was weighted more?
  const topUnderGrowth = (() => {
    const growthWeights = { ...profile.weights };
    const boost = 15;
    growthWeights.growth = Math.min(40, growthWeights.growth + boost);
    // Normalise
    const total = Object.values(growthWeights).reduce((a, b) => a + b, 0);
    Object.keys(growthWeights).forEach(k => {
      (growthWeights as Record<string, number>)[k] = Math.round(
        ((growthWeights as Record<string, number>)[k] / total) * 100
      );
    });
    const reranked = scoreCountries(growthWeights, profile.filters);
    return reranked
      .filter(r => !r.excluded)
      .sort((a, b) => a.customRank - b.customRank)
      .slice(0, 3)
      .map(r => {
        const orig = results.find(x => x.name === r.name);
        return { ...r, origRank: orig?.customRank ?? r.customRank };
      })
      .filter(r => r.origRank > r.customRank + 2);
  })();

  return (
    <div style={{
      background: '#161c27', border: '1px solid #2a3245',
      borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem',
    }}>
      <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Ranking insights
      </div>

      {/* Movers */}
      {(risers.length > 0 || fallers.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          {risers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#4caf82', fontWeight: 600, marginBottom: '0.4rem' }}>
                ▲ Biggest risers under your profile
              </div>
              {risers.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#c4cdd8' }}>{r.name}</span>
                  <span style={{ color: '#4caf82', fontWeight: 600 }}>▲{r.rankChange} places</span>
                </div>
              ))}
            </div>
          )}
          {fallers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#f0a050', fontWeight: 600, marginBottom: '0.4rem' }}>
                ▼ Biggest fallers under your profile
              </div>
              {fallers.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#c4cdd8' }}>{r.name}</span>
                  <span style={{ color: '#f0a050', fontWeight: 600 }}>▼{Math.abs(r.rankChange)} places</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* What-if panels */}
      {(whatIfContract || whatIfPolitical || topUnderGrowth.length > 0) && (
        <>
          <div style={{ borderTop: '1px solid #2a3245', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.6rem' }}>
              💡 What if you adjusted your constraints?
            </div>

            {whatIfContract && whatIfContract.length > 0 && (
              <div style={{
                background: '#0d1f3c', border: '1px solid #1e3a6e',
                borderRadius: 6, padding: '0.6rem 0.8rem', marginBottom: '0.5rem',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#7db4f0', fontWeight: 600, marginBottom: '0.3rem' }}>
                  If you relaxed your contract enforcement red line:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a0aec0' }}>
                  {whatIfContract.map(c => c.name).join(', ')} would become eligible and may enter your top rankings.
                </div>
              </div>
            )}

            {whatIfPolitical && whatIfPolitical.length > 0 && (
              <div style={{
                background: '#0d1f3c', border: '1px solid #1e3a6e',
                borderRadius: 6, padding: '0.6rem 0.8rem', marginBottom: '0.5rem',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#7db4f0', fontWeight: 600, marginBottom: '0.3rem' }}>
                  If you accepted higher political disruption:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a0aec0' }}>
                  {whatIfPolitical.map(c => c.name).join(', ')} would become eligible under your profile.
                </div>
              </div>
            )}

            {topUnderGrowth.length > 0 && (
              <div style={{
                background: '#0d1f3c', border: '1px solid #1e3a6e',
                borderRadius: 6, padding: '0.6rem 0.8rem',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#7db4f0', fontWeight: 600, marginBottom: '0.3rem' }}>
                  If you weighted growth opportunity more heavily:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a0aec0' }}>
                  {topUnderGrowth.map(c => `${c.name} (↑${c.origRank - c.customRank} places)`).join(', ')} would move up significantly.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
