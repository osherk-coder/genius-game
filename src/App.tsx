import { useEffect, useState } from 'react';
import type { Screen } from './screens/nav';
import { useGame } from './store/GameContext';
import { setSoundEnabled } from './sound';
import { BadgeToasts } from './components/ui';
import { Onboarding } from './screens/Onboarding';
import { HomeScreen } from './screens/HomeScreen';
import { IslandScreen } from './screens/IslandScreen';
import { PlayScreen } from './screens/PlayScreen';
import { ExamScreen } from './screens/ExamScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TrophiesScreen } from './screens/TrophiesScreen';
import { MinutesScreen } from './screens/MinutesScreen';
import { ParentScreen } from './screens/ParentScreen';

export default function App() {
  const { state } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [nav, setNav] = useState(0);

  useEffect(() => setSoundEnabled(state.settings.sound), [state.settings.sound]);

  const go = (s: Screen) => {
    setScreen(s);
    setNav((n) => n + 1);
    window.scrollTo(0, 0);
  };

  if (!state.childName) return <Onboarding />;

  let body;
  switch (screen.name) {
    case 'home':
      body = <HomeScreen go={go} />;
      break;
    case 'island':
      body = <IslandScreen topic={screen.topic} go={go} />;
      break;
    case 'play':
      body = <PlayScreen mode={screen.mode} go={go} />;
      break;
    case 'exam':
      body = <ExamScreen go={go} />;
      break;
    case 'shop':
      body = <ShopScreen go={go} />;
      break;
    case 'trophies':
      body = <TrophiesScreen go={go} />;
      break;
    case 'minutes':
      body = <MinutesScreen go={go} />;
      break;
    case 'parent':
      body = <ParentScreen go={go} />;
      break;
  }

  return (
    <>
      <div key={nav} className="fade-in">
        {body}
      </div>
      <BadgeToasts />
    </>
  );
}
