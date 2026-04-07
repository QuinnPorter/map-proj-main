import { useState } from 'react';
import type { Answers } from '../types';
import { QUESTIONS } from '../scoring/questions';
import { PILLARS } from '../scoring/engine';

// Which pillars each question affects, and direction
const QUESTION_PILLAR_IMPACT: Record<string, { pillarId: string; direction: '+' | '-' | '±' }[]> = {
  investorType:           [{ pillarId: 'political', direction: '±' }, { pillarId: 'ruleOfLaw', direction: '±' }, { pillarId: 'growth', direction: '±' }],
  horizon:                [{ pillarId: 'growth', direction: '±' }, { pillarId: 'macro', direction: '±' }],
  exitImportance:         [{ pillarId: 'marketDepth', direction: '±' }, { pillarId: 'growth', direction: '±' }],
  returnPreference:       [{ pillarId: 'growth', direction: '±' }, { pillarId: 'political', direction: '±' }],
  propertyVsPolitical:    [{ pillarId: 'ruleOfLaw', direction: '+' }, { pillarId: 'political', direction: '+' }],
  growthVsMacro:          [{ pillarId: 'growth', direction: '+' }, { pillarId: 'macro', direction: '+' }],
  repatriationVsMarket:   [{ pillarId: 'fx', direction: '+' }, { pillarId: 'growth', direction: '+' }],
  legalVsInfra:           [{ pillarId: 'ruleOfLaw', direction: '+' }, { pillarId: 'infrastructure', direction: '+' }],
  riskTolerance:          [{ pillarId: 'political', direction: '±' }, { pillarId: 'growth', direction: '±' }],
  capitalControls:        [{ pillarId: 'fx', direction: '-' }],
  contractEnforcement:    [{ pillarId: 'ruleOfLaw', direction: '-' }],
  politicalDisruption:    [{ pillarId: 'political', direction: '-' }],
};

interface Props {
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  profile: 'Your investor profile',
  tradeoffs: 'Your priorities',
  redlines: 'Your constraints',
};

const SECTION_ORDER = ['profile', 'tradeoffs', 'redlines'];

export default function Questionnaire({ onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const q = QUESTIONS[current];
  const progress = Math.round((current / QUESTIONS.length) * 100);
  const isLast = current === QUESTIONS.length - 1;
  const prevSection = current > 0 ? QUESTIONS[current - 1].section : null;
  const showSectionHeader = q.section !== prevSection;
  const sectionIdx = SECTION_ORDER.indexOf(q.section) + 1;

  const impacts = QUESTION_PILLAR_IMPACT[q.id] ?? [];

  function handleSelect(value: string) {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (isLast) {
      onComplete(newAnswers);
    } else {
      setTimeout(() => setCurrent(c => c + 1), 150);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem 1rem',
    }}>
      {/* Header bar */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', padding: '0.25rem 0' }}>
          ← Back
        </button>
        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{current + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 640, height: 3, background: '#1e2535', borderRadius: 2, marginBottom: '2.5rem' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#3d7be8', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>

      {/* Section label */}
      {showSectionHeader && (
        <div style={{ width: '100%', maxWidth: 640, marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', color: '#3d7be8', textTransform: 'uppercase' }}>
            {sectionIdx}. {SECTION_LABELS[q.section]}
          </span>
        </div>
      )}

      {/* Question */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#e8ecf0', lineHeight: 1.4, margin: 0 }}>
          {q.text}
        </h2>
      </div>

      {/* Pillar impact indicators */}
      {impacts.length > 0 && (
        <div style={{ width: '100%', maxWidth: 640, marginBottom: '1.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>Affects:</span>
          {impacts.map(impact => {
            const pillar = PILLARS.find(p => p.id === impact.pillarId);
            if (!pillar) return null;
            return (
              <span key={impact.pillarId} style={{
                fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 4,
                background: '#1e2535', color: pillar.color,
                border: `1px solid ${pillar.color}40`,
              }}>
                {pillar.shortName}
              </span>
            );
          })}
        </div>
      )}

      {/* Options */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {q.options.map(opt => {
          const selected = answers[q.id] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                width: '100%', padding: '1rem 1.25rem',
                background: selected ? '#1a2e50' : '#161c27',
                border: `1px solid ${selected ? '#3d7be8' : '#2a3245'}`,
                borderRadius: 8, color: selected ? '#7db4f0' : '#c4cdd8',
                fontSize: '0.95rem', textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.15s ease', fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {isLast && answers[q.id] && (
        <button
          onClick={() => onComplete(answers)}
          style={{
            marginTop: '1.5rem', padding: '0.75rem 2rem',
            background: '#3d7be8', border: 'none', borderRadius: 6,
            color: '#fff', fontSize: '0.95rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          See my results →
        </button>
      )}
    </div>
  );
}
