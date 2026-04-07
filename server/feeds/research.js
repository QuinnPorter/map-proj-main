import fetch from 'node-fetch';
import Parser from 'rss-parser';

const parser = new Parser();

// arXiv search for Africa investment/FDI papers
async function fetchArxiv(country) {
  try {
    const query = encodeURIComponent(`Africa ${country} FDI investment political economy`);
    const url = `https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
    const res = await fetch(url, { timeout: 8000 });
    const xml = await res.text();
    
    // Parse arXiv Atom feed
    const entries = [];
    const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
    for (const match of entryMatches) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '';
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() ?? '';
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
      const link = entry.match(/<id>(.*?)<\/id>/)?.[1] ?? '';
      const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1]).slice(0, 3).join(', ');
      
      if (title && summary) {
        entries.push({ title, summary: summary.substring(0, 300), published, link, authors, source: 'arXiv' });
      }
    }
    return entries;
  } catch (e) {
    console.error('arXiv fetch error:', e.message);
    return [];
  }
}

// World Bank Open Knowledge Repository
async function fetchWorldBank(country) {
  try {
    const query = encodeURIComponent(`${country} investment`);
    const url = `https://search.worldbank.org/api/v2/wds?format=json&qterm=${query}&fl=docdt,repnme,abstracts,docna&rows=5&sort=docdt+desc`;
    const res = await fetch(url, { timeout: 8000 });
    const data = await res.json();
    
    const docs = data?.documents ?? {};
    return Object.values(docs).slice(0, 5).map(doc => ({
      title: doc.repnme ?? doc.docna ?? 'World Bank Document',
      summary: (doc.abstracts ?? '').substring(0, 300),
      published: doc.docdt ?? '',
      link: doc.url ?? '',
      authors: 'World Bank',
      source: 'World Bank',
    })).filter(d => d.title);
  } catch (e) {
    console.error('World Bank fetch error:', e.message);
    return [];
  }
}

// ReliefWeb for research reports on African countries
async function fetchReliefWebReports(country) {
  try {
    const url = `https://api.reliefweb.int/v1/reports?appname=afriinvest&filter[operator]=AND&filter[conditions][0][field]=country.name&filter[conditions][0][value]=${encodeURIComponent(country)}&filter[conditions][1][field]=theme.name&filter[conditions][1][value]=Economy and Development&limit=5&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=body-html&fields[include][]=url`;
    const res = await fetch(url, { timeout: 8000 });
    const data = await res.json();
    
    return (data?.data ?? []).map(item => ({
      title: item.fields?.title ?? '',
      summary: (item.fields?.['body-html'] ?? '').replace(/<[^>]*>/g, '').substring(0, 300),
      published: item.fields?.date?.created ?? '',
      link: item.fields?.url ?? '',
      authors: 'ReliefWeb',
      source: 'ReliefWeb',
    })).filter(d => d.title);
  } catch (e) {
    console.error('ReliefWeb reports fetch error:', e.message);
    return [];
  }
}

// Use Claude to summarise and score research relevance
async function summariseWithClaude(papers, country, anthropic) {
  if (papers.length === 0) return [];
  
  try {
    const paperList = papers.map((p, i) => 
      `${i + 1}. "${p.title}" (${p.source}, ${p.published?.substring(0, 10) ?? 'n/d'})\n   ${p.summary}`
    ).join('\n\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You summarise research papers for investment professionals. Return ONLY valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Summarise these papers for an investor researching ${country}. For each, provide a 1-2 sentence investor-relevant takeaway and rate relevance 1-10.

Papers:
${paperList}

Return JSON array: [{"title": "...", "source": "...", "published": "...", "link": "...", "takeaway": "...", "relevance": 7}]`,
      }],
    });

    const raw = response.content.map(b => b.type === 'text' ? b.text : '').join('');
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
  } catch (e) {
    console.error('Claude summarise error:', e.message);
    // Return raw papers if Claude fails
    return papers.map(p => ({ ...p, takeaway: p.summary, relevance: 5 }));
  }
}

export async function fetchResearchForCountry(country, anthropic) {
  const [arxiv, worldbank, reliefweb] = await Promise.all([
    fetchArxiv(country),
    fetchWorldBank(country),
    fetchReliefWebReports(country),
  ]);

  const allPapers = [...arxiv, ...worldbank, ...reliefweb].slice(0, 10);
  const summarised = await summariseWithClaude(allPapers, country, anthropic);
  
  return {
    country,
    fetchedAt: new Date().toISOString(),
    papers: summarised,
    count: summarised.length,
  };
}
