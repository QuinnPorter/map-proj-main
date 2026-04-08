import type { CountryResult, InvestorProfile } from '../types';
import { scoreCountries } from '../scoring/engine';

interface Props {
  results: CountryResult[];
  profile: InvestorProfile;
  showCustom: boolean;
}

export default function TopMoversPanel({ results, profile, showCustom }: Props) {
  if (!showCustom) return null;

  const movers = [...results].filter(r => !r.excluded && r.rankChange !== 0).sort((a, b) => b.rankChange - a.rankChange);
  const risers = movers.slice(0, 4);
  const fallers = [...movers].reverse().slice(0, 4);

  const whatIfContract = (() => {
    if (!profile.filters.excludeWeakContracts) return null;
    const relaxed = scoreCountries(profile.weights, { ...profile.filters, excludeWeakContracts: false });
    return relaxed.filter(r => !r.excluded).sort((a, b) => a.customRank - b.customRank).slice(0, 10)
      .filter(r => results.find(x => x.name === r.name)?.excluded).slice(0, 3);
  })();

  const whatIfPolitical = (() => {
    if (profile.filters.maxPoliticalDisruption === 'high') return null;
    const relaxed = scoreCountries(profile.weights, { ...profile.filters, maxPoliticalDisruption: 'high' });
    return relaxed.filter(r => !r.excluded).sort((a, b) => a.customRank - b.customRank).slice(0, 10)
      .filter(r => results.find(x => x.name === r.name)?.excluded).slice(0, 3);
  })();

  const topUnderGrowth = (() => {
    const gw = { ...profile.weights };
    gw.growth = Math.min(40, gw.growth + 15);
    const total = Object.values(gw).reduce((a, b) => a + b, 0);
    Object.keys(gw).forEach(k => { (gw as Record<string,number>)[k] = Math.round(((gw as Record<string,number>)[k] / total) * 100); });
    const reranked = scoreCountries(gw, profile.filters);
    return reranked.filter(r => !r.excluded).sort((a, b) => a.customRank - b.customRank).slice(0, 3)
      .map(r => { const orig = results.find(x => x.name === r.name); return { ...r, origRank: orig?.customRank ?? r.customRank }; })
      .filter(r => r.origRank > r.customRank + 2);
  })();

  const hasWhatIf = (whatIfContract?.length ?? 0) > 0 || (whatIfPolitical?.length ?? 0) > 0 || topUnderGrowth.length > 0;

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '1rem 1.1rem', marginBottom: '1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '0.72rem', color: '#8a9ab0', fontWeight: 600, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Ranking insights
      </div>

      {(risers.length > 0 || fallers.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: hasWhatIf ? '0.85rem' : 0 }}>
          {risers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#2e7d52', fontWeight: 600, marginBottom: '0.4rem' }}>▲ Biggest risers</div>
              {risers.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#1a2035' }}>{r.name}</span>
                  <span style={{ color: '#2e7d52', fontWeight: 600 }}>▲{r.rankChange}</span>
                </div>
              ))}
            </div>
          )}
          {fallers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#c05020', fontWeight: 600, marginBottom: '0.4rem' }}>▼ Biggest fallers</div>
              {fallers.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#1a2035' }}>{r.name}</span>
                  <span style={{ color: '#c05020', fontWeight: 600 }}>▼{Math.abs(r.rankChange)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hasWhatIf && (
        <div style={{ borderTop: '1px solid #f1f3f5', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.5rem' }}>
            💡 What if you adjusted your constraints?
          </div>
          {whatIfContract && whatIfContract.length > 0 && (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d7f8', borderRadius: 6, padding: '0.55rem 0.75rem', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.2rem' }}>If you relaxed your contract enforcement red line:</div>
              <div style={{ fontSize: '0.75rem', color: '#1a2035' }}>{whatIfContract.map(c => c.name).join(', ')} would become eligible.</div>
            </div>
          )}
          {whatIfPolitical && whatIfPolitical.length > 0 && (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d7f8', borderRadius: 6, padding: '0.55rem 0.75rem', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.2rem' }}>If you accepted higher political disruption:</div>
              <div style={{ fontSize: '0.75rem', color: '#1a2035' }}>{whatIfPolitical.map(c => c.name).join(', ')} would become eligible.</div>
            </div>
          )}
          {topUnderGrowth.length > 0 && (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d7f8', borderRadius: 6, padding: '0.55rem 0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#3d7be8', fontWeight: 600, marginBottom: '0.2rem' }}>If you weighted growth opportunity more:</div>
              <div style={{ fontSize: '0.75rem', color: '#1a2035' }}>{topUnderGrowth.map(c => `${c.name} (↑${c.origRank - c.customRank})`).join(', ')} would move up.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
