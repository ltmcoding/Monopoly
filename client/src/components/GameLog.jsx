import React, { useEffect, useRef } from 'react';
import { formatTime } from '../utils/formatters';

export default function GameLog({ actionLog }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLog]);

  return (
    <div className="game-log">
      <h3>Game Log</h3>
      <div className="log-messages">
        {actionLog && actionLog.length > 0 ? (
          actionLog.map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="log-entry">
              <span className="log-time">{formatTime(entry.timestamp)}</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))
        ) : (
          <div className="log-empty">No actions yet</div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
