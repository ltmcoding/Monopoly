import React, { useEffect, useRef, useState } from 'react';
import { ClockCounterClockwise, ChatCircle, PaperPlaneTilt, ChatCircleDots } from '@phosphor-icons/react';
import { formatTime } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function GameLog({ actionLog, socket, gameId, playerId, players }) {
  const logEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('combined'); // 'combined' shows both

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = ({ chatMessage }) => {
      setChatMessages(prev => [...prev.slice(-99), chatMessage]);
    };

    socket.on('chatMessageReceived', handleChatMessage);

    return () => {
      socket.off('chatMessageReceived', handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLog, chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    try {
      await socket.sendChatMessage(gameId, chatInput.trim());
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Combine and sort action log and chat messages by timestamp
  const combinedMessages = [
    ...(actionLog || []).map(entry => ({ ...entry, type: 'action' })),
    ...chatMessages.map(msg => ({ ...msg, type: msg.type === 'system' ? 'system' : 'chat', timestamp: msg.timestamp || Date.now() }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card className="flex-1 min-h-0 flex flex-col card-gilded">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <ChatCircle size={20} className="text-primary" weight="duotone" />
          Log & Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-3 pt-0 gap-2">
        {/* Combined messages area */}
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {combinedMessages.length > 0 ? (
            combinedMessages.map((entry, index) => (
              <div
                key={`${entry.timestamp}-${index}`}
                className={`text-sm p-2 rounded transition-colors ${
                  entry.type === 'chat'
                    ? 'bg-primary/10 border-l-2 border-primary/30'
                    : entry.type === 'system'
                    ? 'bg-secondary/20 italic text-muted-foreground'
                    : 'bg-secondary/30'
                }`}
              >
                {entry.type === 'chat' ? (
                  <div className="flex gap-2">
                    <span className="font-semibold" style={{ color: entry.playerColor }}>
                      {entry.playerName}
                    </span>
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                ) : entry.type === 'system' ? (
                  <span>{entry.message}</span>
                ) : (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground font-mono shrink-0 text-xs">
                      {formatTime(entry.timestamp)}
                    </span>
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ChatCircleDots size={32} className="opacity-50 mb-2" />
              <span className="text-sm">No activity yet</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Chat input */}
        {socket && (
          <form className="flex gap-2 pt-2 border-t border-border" onSubmit={handleSendMessage}>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
              className="flex-1 text-sm h-9"
            />
            <Button type="submit" size="icon" disabled={!chatInput.trim()} className="h-9 w-9">
              <PaperPlaneTilt size={16} />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
