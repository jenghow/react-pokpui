import { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene3D } from './components/Scene3D';
import { UI } from './components/UI';
import { useShakeDetection, requestMotionPermission } from './hooks/useShakeDetection';
import type { Phase, ThrowResult } from './types';
import './App.css';

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<ThrowResult>('pending');
  const [resetCount, setResetCount] = useState(0);
  const motionPermissionRequested = useRef(false);

  const handleAsk = useCallback(() => {
    if (!motionPermissionRequested.current) {
      motionPermissionRequested.current = true;
      requestMotionPermission();
    }
    setPhase('throwing');
    setResult('pending');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setResult('pending');
    setResetCount(c => c + 1);
  }, []);

  const handleResult = useCallback((r: ThrowResult) => {
    setResult(r);
  }, []);

  useShakeDetection(handleAsk, phase === 'idle');

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.5, 5.5], fov: 50, near: 0.1, far: 20 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#2D1B0E');
          gl.toneMapping = 0;
        }}
      >
        <Scene3D
          phase={phase}
          onPhaseChange={setPhase}
          onResult={handleResult}
          resetCount={resetCount}
        />
      </Canvas>
      <UI phase={phase} result={result} onAsk={handleAsk} onReset={handleReset} />
    </div>
  );
}
