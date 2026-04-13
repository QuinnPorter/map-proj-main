import { useState, useEffect } from 'react';
import type { Answers } from '../types';
import { QUESTIONS } from '../scoring/questions';
import { PILLARS } from '../scoring/engine';

const QUESTION_PILLAR_IMPACT: Record<string, { pillarId: string }[]> = {
  investorType:           [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
  sectorFocus:            [{ pillarId: 'infrastructure' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
  horizon:                [{ pillarId: 'growth' }, { pillarId: 'macro' }],
  exitImportance:         [{ pillarId: 'marketDepth' }, { pillarId: 'growth' }],
  returnPreference:       [{ pillarId: 'growth' }, { pillarId: 'political' }],
  currencyPreference:     [{ pillarId: 'fx' }],
  ownershipStructure:     [{ pillarId: 'ruleOfLaw' }, { pillarId: 'marketDepth' }],
  localPartner:           [{ pillarId: 'ruleOfLaw' }, { pillarId: 'infrastructure' }],
  propertyVsPolitical:    [{ pillarId: 'ruleOfLaw' }, { pillarId: 'political' }],
  growthVsMacro:          [{ pillarId: 'growth' }, { pillarId: 'macro' }],
  repatriationVsMarket:   [{ pillarId: 'fx' }, { pillarId: 'growth' }],
  legalVsInfra:           [{ pillarId: 'ruleOfLaw' }, { pillarId: 'infrastructure' }],
  riskTolerance:          [{ pillarId: 'political' }, { pillarId: 'growth' }],
  esgConstraints:         [{ pillarId: 'ruleOfLaw' }, { pillarId: 'political' }],
  capitalControls:        [{ pillarId: 'fx' }],
  contractEnforcement:    [{ pillarId: 'ruleOfLaw' }],
  politicalDisruption:    [{ pillarId: 'political' }],
  sanctionsFilter:        [{ pillarId: 'businessEnv' }],
  nationalisationFilter:  [{ pillarId: 'businessEnv' }],
  talentAccess:           [{ pillarId: 'infrastructure' }, { pillarId: 'growth' }],
  workforceType:          [{ pillarId: 'infrastructure' }, { pillarId: 'growth' }],
  fdiOpenness:            [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }],
  powerReliability:       [{ pillarId: 'infrastructure' }],
  logisticsImportance:    [{ pillarId: 'infrastructure' }, { pillarId: 'marketDepth' }],
  sezRelevance:           [{ pillarId: 'infrastructure' }],
  approvalTolerance:      [{ pillarId: 'ruleOfLaw' }, { pillarId: 'marketDepth' }],
  judicialImportance:     [{ pillarId: 'ruleOfLaw' }],
  bureaucracyTolerance:   [{ pillarId: 'ruleOfLaw' }, { pillarId: 'infrastructure' }],
  hedgeInterest:          [],
  hedgeType:              [],
  mostImportantFactor:    [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
  leastImportantFactor:   [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
};

const SECTION_LABELS: Record<string, string> = {
  profile: 'Your investor profile',
  tradeoffs: 'Your priorities',
  redlines: 'Your constraints',
  people: 'People & talent',
  infrastructure: 'Infrastructure',
  permits: 'Permits & governance',
  hedging: 'Hedging & diversification',
  importance: 'What matters most',
};

const SECTION_ORDER = ['profile', 'tradeoffs', 'redlines', 'people', 'infrastructure', 'permits', 'hedging', 'importance'];

interface AdaptiveQuestion {
  id: string;
  text: string;
  section: 'adaptive';
  pillarId: string;
  options: { value: string; label: string; delta: number }[];
}

interface Props {
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}

async function generateAdaptiveQuestions(answers: Answers): Promise<AdaptiveQuestion[]> {
  const sectorFocus = answers.sectorFocus || 'diversified';
  const investorType = answers.investorType || 'pe';
  const horizon = answers.horizon || 'medium';

  const prompt = `You are helping an Africa investor build a custom investability score. Based on their profile, generate 2 targeted follow-up questions that would meaningfully refine their score.

Investor profile:
- Type: ${investorType}
- Sector: ${sectorFocus}
- Horizon: ${horizon}
- Risk tolerance: ${answers.riskTolerance || 'moderate'}
- Currency preference: ${answers.currencyPreference || 'hardPreferred'}

Rules:
1. Only ask questions highly relevant to their specific sector/type combo. For example: energy investors → ask about grid reliability or temperature. Fintech → ask about mobile penetration or digital regulation. Agriculture → ask about rainfall reliability or land tenure. Manufacturing → ask about port access or labour costs.
2. Each question must affect a specific scoring pillar
3. Do NOT repeat questions already answered
4. Questions should be specific and practical, not generic

Return ONLY a JSON array (no markdown, no explanation) with exactly this structure:
[
  {
    "id": "adaptive_1",
    "text": "Question text?",
    "pillarId": "one of: political|ruleOfLaw|fx|macro|marketDepth|infrastructure|growth|businessEnv",
    "options": [
      {"value": "a", "label": "Option label", "delta": 8},
      {"value": "b", "label": "Option label", "delta": 3},
      {"value": "c", "label": "Option label", "delta": -3}
    ]
  },
  {
    "id": "adaptive_2",
    "text": "Second question text?",
    "pillarId": "pillar_id",
    "options": [
      {"value": "a", "label": "Option label", "delta": 8},
      {"value": "b", "label": "Option label", "delta": 3},
      {"value": "c", "label": "Option label", "delta": -3}
    ]
  }
]

Generate exactly 2 questions. Return only raw JSON, no markdown fences.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.map((q: AdaptiveQuestion) => ({ ...q, section: 'adaptive' as const }));
  } catch {
    return [];
  }
}

export default function Questionnaire({ onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([]);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);
  const [adaptiveLoaded, setAdaptiveLoaded] = useState(false);
  const [showAdaptive, setShowAdaptive] = useState(false);
  const [adaptiveCurrent, setAdaptiveCurrent] = useState(0);

  const isLastStandard = current === QUESTIONS.length - 1;
  const inAdaptive = showAdaptive && adaptiveQuestions.length > 0;

  const q = !inAdaptive ? QUESTIONS[current] : null;
  const aq = inAdaptive ? adaptiveQuestions[adaptiveCurrent] : null;
  const activeQuestion = q || aq;

  const totalStandard = QUESTIONS.length;
  const totalAdaptive = adaptiveQuestions.length;
  const totalQuestions = totalStandard + totalAdaptive;
  const currentPos = inAdaptive ? totalStandard + adaptiveCurrent : current;
  const progress = Math.round((currentPos / Math.max(totalQuestions, 1)) * 100);

  const prevSection = !inAdaptive && current > 0 ? QUESTIONS[current - 1].section : null;
  const showSectionHeader = !inAdaptive && q && q.section !== prevSection;
  const sectionIdx = q ? SECTION_ORDER.indexOf(q.section) + 1 : SECTION_ORDER.length + 1;
  const impacts = q ? (QUESTION_PILLAR_IMPACT[q.id] ?? []) : aq ? [{ pillarId: aq.pillarId }] : [];

  // Trigger adaptive generation after first section (8 profile questions)
  useEffect(() => {
    if (current === 8 && !adaptiveLoaded && !adaptiveLoading) {
      setAdaptiveLoading(true);
      generateAdaptiveQuestions(answers).then(qs => {
        setAdaptiveQuestions(qs);
        setAdaptiveLoaded(true);
        setAdaptiveLoading(false);
      });
    }
  }, [current]);

  function handleSelect(value: string) {
    if (!activeQuestion) return;
    const newAnswers = { ...answers, [activeQuestion.id]: value };
    setAnswers(newAnswers);

    if (inAdaptive) {
      const isLastAdaptive = adaptiveCurrent === adaptiveQuestions.length - 1;
      if (isLastAdaptive) {
        setTimeout(() => onComplete(newAnswers), 150);
      } else {
        setTimeout(() => setAdaptiveCurrent(c => c + 1), 150);
      }
    } else {
      if (isLastStandard) {
        if (adaptiveQuestions.length > 0) {
          setTimeout(() => setShowAdaptive(true), 150);
        } else if (adaptiveLoaded) {
          setTimeout(() => onComplete(newAnswers), 150);
        } else {
          const wait = setInterval(() => {
            if (!adaptiveLoading) {
              clearInterval(wait);
              if (adaptiveQuestions.length > 0) {
                setShowAdaptive(true);
              } else {
                onComplete(newAnswers);
              }
            }
          }, 200);
        }
      } else {
        setTimeout(() => setCurrent(c => c + 1), 150);
      }
    }
  }

  if (!activeQuestion) return null;

  return (
    <div style={{
      minHeight: '100vh', background: '#f8f9fb',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1.5rem 1rem',
    }}>
      {/* Nav */}
      <div style={{
        width: '100%', maxWidth: 580,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#8a9ab0',
          cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontFamily: 'inherit',
        }}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: '#3d7be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ fontWeight: 700, color: '#1a2035', fontSize: '0.82rem' }}>AfriInvest</span>
        </div>
        <span style={{ color: '#8a9ab0', fontSize: '0.82rem' }}>{currentPos + 1} / {totalQuestions || '?'}</span>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 580, height: 4, background: '#e2e6ea', borderRadius: 2, marginBottom: '2rem' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: inAdaptive
            ? 'linear-gradient(90deg, #6b4fcc, #c46b7a)'
            : 'linear-gradient(90deg, #3d7be8, #6b4fcc)',
          borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Section header */}
        {(showSectionHeader || (inAdaptive && adaptiveCurrent === 0)) && (
          <div style={{ marginBottom: '0.85rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              color: inAdaptive ? '#6b4fcc' : '#3d7be8',
              textTransform: 'uppercase',
              background: inAdaptive ? '#f3f0ff' : '#eef2ff',
              padding: '0.25rem 0.7rem', borderRadius: 4,
            }}>
              {inAdaptive ? '✦ Tailored to your profile' : `${sectionIdx}. ${SECTION_LABELS[activeQuestion.section] || ''}`}
            </span>
          </div>
        )}

        {/* Adaptive loading badge */}
        {adaptiveLoading && !inAdaptive && (
          <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', color: '#6b4fcc', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f3f0ff', padding: '0.4rem 0.7rem', borderRadius: 6 }}>
            <span>⟳</span> Generating personalised follow-up questions for your profile…
          </div>
        )}

        {/* Question */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a2035', lineHeight: 1.4, margin: '0 0 0.85rem' }}>
          {activeQuestion.text}
        </h2>

        {/* Pillar indicators */}
        {impacts.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.1rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8a9ab0' }}>Affects:</span>
            {impacts.map(impact => {
              const pillar = PILLARS.find(p => p.id === impact.pillarId);
              if (!pillar) return null;
              return (
                <span key={impact.pillarId} style={{
                  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 4,
                  background: '#f8f9fb', color: pillar.color,
                  border: `1px solid ${pillar.color}40`, fontWeight: 600,
                }}>
                  {pillar.shortName}
                </span>
              );
            })}
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {activeQuestion.options.map(opt => {
            const selected = answers[activeQuestion.id] === opt.value;
            return (
              <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
                width: '100%', padding: '0.9rem 1.1rem',
                background: selected ? (inAdaptive ? '#f3f0ff' : '#eef2ff') : '#fff',
                border: `1px solid ${selected ? (inAdaptive ? '#6b4fcc' : '#3d7be8') : '#e2e6ea'}`,
                borderRadius: 8, color: selected ? (inAdaptive ? '#6b4fcc' : '#3d7be8') : '#1a2035',
                fontSize: '0.92rem', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: selected ? 600 : 400,
                transition: 'all 0.12s ease',
                boxShadow: selected ? `0 0 0 3px rgba(${inAdaptive ? '107,79,204' : '61,123,232'},0.12)` : '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Final submit */}
        {((inAdaptive && adaptiveCurrent === adaptiveQuestions.length - 1) ||
          (isLastStandard && adaptiveQuestions.length === 0 && adaptiveLoaded)) &&
          answers[activeQuestion.id] && (
          <button onClick={() => onComplete(answers)} style={{
            marginTop: '1.25rem', width: '100%', padding: '0.85rem',
            background: 'linear-gradient(135deg, #3d7be8, #6b4fcc)',
            border: 'none', borderRadius: 8, color: '#fff',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(61,123,232,0.3)',
          }}>
            See my results →
          </button>
        )}
      </div>
    </div>
  );
}
