import { useState } from 'react';
import type { AppState, Answers, InvestorProfile } from './types';
import { deriveProfile } from './scoring/questions';
import Landing from './components/Landing';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [profile, setProfile] = useState<InvestorProfile | null>(null);

  function handleQuestionnaireDone(answers: Answers) {
    const derived = deriveProfile(answers);
    setProfile(derived);
    setAppState('results');
  }

  return (
    <>
      {appState === 'landing' && (
        <Landing onStart={() => setAppState('questionnaire')} />
      )}
      {appState === 'questionnaire' && (
        <Questionnaire
          onComplete={handleQuestionnaireDone}
          onBack={() => setAppState('landing')}
        />
      )}
      {appState === 'results' && profile && (
        <Results
          profile={profile}
          onReset={() => setAppState('questionnaire')}
        />
      )}
    </>
  );
}