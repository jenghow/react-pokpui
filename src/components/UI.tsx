import type { Phase, ThrowResult } from '../types';
import { RESULT_LABELS, RESULT_MEANINGS } from '../types';

interface UIProps {
  phase: Phase;
  result: ThrowResult;
  onAsk: () => void;
  onReset: () => void;
}

export function UI({ phase, result, onAsk, onReset }: UIProps) {
  const busy = phase === 'throwing' || phase === 'settling';

  return (
    <div className="ui-overlay">
      {result !== 'pending' && phase === 'result' && (
        <div className="result-card">
          <div className="result-title">{RESULT_LABELS[result]}</div>
          <div className="result-meaning">{RESULT_MEANINGS[result]}</div>
        </div>
      )}
      <div className="button-row">
        <button className="btn btn-ask" onClick={onAsk} disabled={busy}>
          {busy ? '掷筊中...' : 'Ask 掟'}
        </button>
        <button className="btn btn-reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
