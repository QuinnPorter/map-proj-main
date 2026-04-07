import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { fetchResearchForCountry } from './feeds/research.js';
import { fetchLeadershipForCountry } from './feeds/leadership.js';
import { getCache, setCache } from './cache.js';
import { scheduleRefresh } from './scheduler.js';

const app = express();
const PORT = process.env.PORT || 3001;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Research assistant (proxies Claude API) ───────────────────────────────────
app.post('/api/research', async (req, res) => {
  try {
    const { messages, countryName, pillarName } = req.body;

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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    res.json({ content: response.content });
  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({ error: 'Research assistant error', details: error.message });
  }
});

// ── Leadership sentiment analysis ─────────────────────────────────────────────
app.post('/api/leadership', async (req, res) => {
  try {
    const { text, countryName, leader } = req.body;

    const systemPrompt = `You are an expert in political economy and investment climate analysis, specialising in Africa. Analyse speeches, press releases, and statements from political leaders to assess their investment-friendliness.

Return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:
{
  "investmentFriendliness": <number 0-100>,
  "emotionalRegister": "<one of: Confident, Cautious, Urgent, Defensive, Conciliatory, Nationalistic, Technocratic, Populist>",
  "keyPhrases": ["<phrase 1>", "<phrase 2>", "<phrase 3>", "<phrase 4>", "<phrase 5>"],
  "commitments": ["<specific commitment made>", ...],
  "redFlags": ["<concern for investors>", ...],
  "summary": "<2-3 sentence plain English summary for an investor>"
}

Score 0-100: 0-20=hostile, 20-40=sceptical, 40-60=neutral, 60-80=friendly, 80-100=strongly pro-investment.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `${countryName ? `Country: ${countryName}\n` : ''}${leader ? `Speaker: ${leader}\n` : ''}\nText:\n${text}`,
      }],
    });

    const raw = response.content.map(b => b.type === 'text' ? b.text : '').join('');
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (error) {
    console.error('Leadership API error:', error);
    res.status(500).json({ error: 'Leadership analysis error', details: error.message });
  }
});

// ── Live feeds: research papers for a country ────────────────────────────────
app.get('/api/feeds/research/:country', async (req, res) => {
  try {
    const country = decodeURIComponent(req.params.country);
    const cacheKey = `research:${country}`;
    
    // Return cached if fresh (< 24 hours)
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const results = await fetchResearchForCountry(country, anthropic);
    setCache(cacheKey, results, 24 * 60 * 60 * 1000);
    res.json(results);
  } catch (error) {
    console.error('Research feed error:', error);
    res.status(500).json({ error: 'Feed error', details: error.message });
  }
});

// ── Live feeds: leadership content for a country ─────────────────────────────
app.get('/api/feeds/leadership/:country', async (req, res) => {
  try {
    const country = decodeURIComponent(req.params.country);
    const cacheKey = `leadership:${country}`;

    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const results = await fetchLeadershipForCountry(country, anthropic);
    setCache(cacheKey, results, 6 * 60 * 60 * 1000); // 6 hour cache for news
    res.json(results);
  } catch (error) {
    console.error('Leadership feed error:', error);
    res.status(500).json({ error: 'Feed error', details: error.message });
  }
});

// ── Get all cached feed summaries (for ranking integration) ──────────────────
app.get('/api/feeds/summary', (req, res) => {
  const summary = getCache('feed:summary') ?? {};
  res.json(summary);
});

// Start server
app.listen(PORT, () => {
  console.log(`AfriInvest server running on port ${PORT}`);
  scheduleRefresh(anthropic);
});
