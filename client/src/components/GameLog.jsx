import React, { useEffect, useRef } from 'react';
import { ClockCounterClockwise, ChatCircleDots } from '@phosphor-icons/react';
import { formatTime } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function GameLog({ actionLog }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLog]);

  return (
    <Card className="flex-1 min-h-0 flex flex-col card-gilded">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-base flex items-center gap-2.5">
          <ClockCounterClockwise size={22} className="text-primary" weight="duotone" />
          Game Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 pt-0">
        <div className="space-y-1.5">
          {actionLog && actionLog.length > 0 ? (
            actionLog.map((entry, index) => (
              <div
                key={`${entry.timestamp}-${index}`}
                className="flex gap-2.5 text-sm p-2.5 rounded bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <span className="text-muted-foreground font-mono shrink-0">
                  {formatTime(entry.timestamp)}
                </span>
                <span className="text-foreground">{entry.message}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ChatCircleDots size={32} className="opacity-50 mb-2" />
              <span className="text-sm">No actions yet</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}
