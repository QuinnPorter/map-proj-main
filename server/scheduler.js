import cron from 'node-cron';
import { fetchResearchForCountry } from './feeds/research.js';
import { fetchLeadershipForCountry } from './feeds/leadership.js';
import { setCache, getCache } from './cache.js';

// Top countries to pre-fetch (most viewed/highest ranked)
const PRIORITY_COUNTRIES = [
  'Kenya', 'Rwanda', 'Ghana', 'Morocco', 'Egypt',
  'South Africa', 'Nigeria', 'Tanzania', 'Ethiopia', 'Botswana',
  'Ivory Coast', 'Senegal', 'Mauritius', 'Namibia', 'Tunisia',
];

async function refreshCountry(country, anthropic) {
  try {
    console.log(`Refreshing feeds for ${country}...`);
    
    const [research, leadership] = await Promise.all([
      fetchResearchForCountry(country, anthropic),
      fetchLeadershipForCountry(country, anthropic),
    ]);

    setCache(`research:${country}`, research, 24 * 60 * 60 * 1000);
    setCache(`leadership:${country}`, leadership, 6 * 60 * 60 * 1000);

    return { country, researchCount: research.count, leadershipCount: leadership.count };
  } catch (e) {
    console.error(`Error refreshing ${country}:`, e.message);
    return { country, error: e.message };
  }
}

async function refreshAll(anthropic) {
  console.log('Starting nightly feed refresh...');
  const results = [];

  // Stagger requests to avoid rate limits
  for (const country of PRIORITY_COUNTRIES) {
    const result = await refreshCountry(country, anthropic);
    results.push(result);
    await new Promise(r => setTimeout(r, 2000)); // 2 second pause between countries
  }

  // Build aggregate summary for ranking integration
  const summary = {};
  for (const country of PRIORITY_COUNTRIES) {
    const leadership = getCache(`leadership:${country}`);
    if (leadership?.aggregateScore != null) {
      summary[country] = {
        leadershipScore: leadership.aggregateScore,
        trend: leadership.trend,
        updatedAt: leadership.fetchedAt,
      };
    }
  }
  setCache('feed:summary', summary, 25 * 60 * 60 * 1000);

  console.log(`Feed refresh complete. Updated ${results.length} countries.`);
}

export function scheduleRefresh(anthropic) {
  // Run at 2am UTC every day
  cron.schedule('0 2 * * *', () => refreshAll(anthropic));

  // Also run once on startup after a 30 second delay
  // (so the server is fully ready first)
  setTimeout(() => {
    console.log('Running initial feed fetch for priority countries...');
    refreshAll(anthropic).catch(console.error);
  }, 30000);

  console.log('Feed refresh scheduler started (daily at 2am UTC)');
}
