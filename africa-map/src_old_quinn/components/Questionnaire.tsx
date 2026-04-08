import { useState } from 'react';
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
  mostImportantFactor:    [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
  leastImportantFactor:   [{ pillarId: 'political' }, { pillarId: 'ruleOfLaw' }, { pillarId: 'growth' }],
};

const SECTION_LABELS: Record<string, string> = {
  profile: 'Your investor profile',
  tradeoffs: 'Your priorities',
  redlines: 'Your constraints',
  importance: 'What matters most',
};

const SECTION_ORDER = ['profile', 'tradeoffs', 'redlines', 'importance'];

interface Props {
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}

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
        <span style={{ color: '#8a9ab0', fontSize: '0.82rem' }}>{current + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 580, height: 4, background: '#e2e6ea', borderRadius: 2, marginBottom: '2rem' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #3d7be8, #6b4fcc)',
          borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Section header */}
        {showSectionHeader && (
          <div style={{ marginBottom: '0.85rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              color: '#3d7be8', textTransform: 'uppercase',
              background: '#eef2ff', padding: '0.25rem 0.7rem',
              borderRadius: 4,
            }}>
              {sectionIdx}. {SECTION_LABELS[q.section]}
            </span>
          </div>
        )}

        {/* Question */}
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 700, color: '#1a2035',
          lineHeight: 1.4, margin: '0 0 0.85rem',
        }}>
          {q.text}
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
          {q.options.map(opt => {
            const selected = answers[q.id] === opt.value;
            return (
              <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
                width: '100%', padding: '0.9rem 1.1rem',
                background: selected ? '#eef2ff' : '#fff',
                border: `1px solid ${selected ? '#3d7be8' : '#e2e6ea'}`,
                borderRadius: 8, color: selected ? '#3d7be8' : '#1a2035',
                fontSize: '0.92rem', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: selected ? 600 : 400,
                transition: 'all 0.12s ease',
                boxShadow: selected ? '0 0 0 3px rgba(61,123,232,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                {opt.label}
              </button>
            );
          })}
        </div>

        {isLast && answers[q.id] && (
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
