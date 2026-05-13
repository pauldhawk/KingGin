import { GameProvider, useGame } from './state/GameContext';
import { StartScreen } from './ui/StartScreen';
import { GameTable } from './ui/GameTable';

function GameRoot() {
  const { state } = useGame();
  return state.phase === 'idle' ? <StartScreen /> : <GameTable />;
}

export default function App() {
  return (
    <GameProvider>
      <GameRoot />
    </GameProvider>
  );
}
