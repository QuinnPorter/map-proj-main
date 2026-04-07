import fetch from 'node-fetch';
import Parser from 'rss-parser';

const parser = new Parser();

// ReliefWeb for government statements and press releases
async function fetchReliefWebStatements(country) {
  try {
    const url = `https://api.reliefweb.int/v1/reports?appname=afriinvest&filter[operator]=AND&filter[conditions][0][field]=country.name&filter[conditions][0][value]=${encodeURIComponent(country)}&filter[conditions][1][field]=source.type&filter[conditions][1][value]=Government&limit=8&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=body-html&fields[include][]=source&fields[include][]=url`;
    const res = await fetch(url, { timeout: 8000 });
    const data = await res.json();

    return (data?.data ?? []).map(item => ({
      title: item.fields?.title ?? '',
      text: (item.fields?.['body-html'] ?? '').replace(/<[^>]*>/g, '').substring(0, 1000),
      published: item.fields?.date?.created ?? '',
      source: item.fields?.source?.[0]?.name ?? 'Government',
      link: item.fields?.url ?? '',
      type: 'government_statement',
    })).filter(d => d.title && d.text.length > 50);
  } catch (e) {
    console.error('ReliefWeb statements error:', e.message);
    return [];
  }
}

// AllAfrica RSS feed
async function fetchAllAfrica(country) {
  try {
    const countrySlug = country.toLowerCase().replace(/\s+/g, '');
    const url = `https://allafrica.com/afdb/${countrySlug}.rss`;
    const feed = await parser.parseURL(url).catch(() => null);
    if (!feed) return [];

    return (feed.items ?? []).slice(0, 8).map(item => ({
      title: item.title ?? '',
      text: (item.contentSnippet ?? item.content ?? '').substring(0, 800),
      published: item.pubDate ?? '',
      source: 'AllAfrica',
      link: item.link ?? '',
      type: 'news',
    })).filter(d => d.title);
  } catch (e) {
    console.error('AllAfrica fetch error:', e.message);
    return [];
  }
}

// African Arguments RSS
async function fetchAfricanArguments(country) {
  try {
    const feed = await parser.parseURL('https://africanarguments.org/feed/').catch(() => null);
    if (!feed) return [];

    return (feed.items ?? [])
      .filter(item => item.title?.toLowerCase().includes(country.toLowerCase()) || 
                      item.contentSnippet?.toLowerCase().includes(country.toLowerCase()))
      .slice(0, 5)
      .map(item => ({
        title: item.title ?? '',
        text: (item.contentSnippet ?? '').substring(0, 600),
        published: item.pubDate ?? '',
        source: 'African Arguments',
        link: item.link ?? '',
        type: 'analysis',
      }));
  } catch (e) {
    console.error('African Arguments fetch error:', e.message);
    return [];
  }
}

// Claude analyses content for investment signals
async function analyseWithClaude(items, country, anthropic) {
  if (items.length === 0) return { items: [], aggregateScore: null };

  try {
    const itemList = items.slice(0, 6).map((item, i) =>
      `${i + 1}. [${item.source}] "${item.title}" (${item.published?.substring(0, 10) ?? 'n/d'})\n   ${item.text.substring(0, 400)}`
    ).join('\n\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: 'You analyse African political and economic content for investment signals. Return ONLY valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Analyse these recent items about ${country} for investment-relevant signals.

Items:
${itemList}

Return JSON:
{
  "aggregateScore": <0-100 overall investment-friendliness of recent signals>,
  "trend": "<improving|stable|deteriorating>",
  "items": [
    {
      "title": "...",
      "source": "...",
      "published": "...",
      "link": "...",
      "investmentScore": <0-100>,
      "keySignals": ["signal 1", "signal 2"],
      "sentiment": "<positive|neutral|negative>",
      "summary": "<1-2 sentence investor takeaway>"
    }
  ]
}`,
      }],
    });

    const raw = response.content.map(b => b.type === 'text' ? b.text : '').join('');
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('Claude leadership analyse error:', e.message);
    return {
      aggregateScore: null,
      trend: 'stable',
      items: items.slice(0, 6).map(item => ({
        ...item,
        investmentScore: 50,
        keySignals: [],
        sentiment: 'neutral',
        summary: item.text.substring(0, 150),
      })),
    };
  }
}

export async function fetchLeadershipForCountry(country, anthropic) {
  const [reliefweb, allafrica, africanArguments] = await Promise.all([
    fetchReliefWebStatements(country),
    fetchAllAfrica(country),
    fetchAfricanArguments(country),
  ]);

  const allItems = [...reliefweb, ...allafrica, ...africanArguments]
    .sort((a, b) => new Date(b.published ?? 0) - new Date(a.published ?? 0))
    .slice(0, 10);

  const analysed = await analyseWithClaude(allItems, country, anthropic);

  return {
    country,
    fetchedAt: new Date().toISOString(),
    aggregateScore: analysed.aggregateScore,
    trend: analysed.trend,
    items: analysed.items ?? [],
    count: analysed.items?.length ?? 0,
  };
}
