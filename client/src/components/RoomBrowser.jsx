import React, { useState, useEffect } from 'react';
import {
  SquaresFour,
  X,
  ArrowClockwise,
  WarningCircle,
  Lock,
  LockOpen,
  User,
  Users,
  SignIn,
  XSquare
} from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export default function RoomBrowser({ socket, playerName, onJoin, onClose, disabled }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    if (!socket.connected) {
      setError('Not connected to server');
      setLoading(false);
      return;
    }

    if (rooms.length === 0) {
      setLoading(true);
    }

    try {
      const response = await socket.getGamesList();
      setRooms(response.games || []);
      setError('');
    } catch (err) {
      if (err.message === 'Socket not connected') {
        setError('Not connected to server');
      } else if (err.message === 'Request timed out') {
        setError('Server not responding');
      } else {
        setError('Failed to fetch rooms');
      }
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket.connected) {
      fetchRooms();
    }

    const interval = setInterval(() => {
      if (socket.connected) {
        fetchRooms();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [socket.connected]);

  const handleJoin = (gameId) => {
    if (!disabled) {
      onJoin(gameId);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <SquaresFour size={24} className="text-primary" />
            <DialogTitle>Room Browser</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRooms}
              disabled={loading}
              className="gap-2"
            >
              <ArrowClockwise size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <WarningCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Room List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading && rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <XSquare size={48} className="mb-4 opacity-50" />
                <p className="text-lg mb-1">No rooms available</p>
                <span className="text-sm">Click Play to create a new room</span>
              </div>
            ) : (
              rooms.map(room => (
                <div
                  key={room.gameId}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 hover:bg-secondary transition-colors"
                >
                  <div className="space-y-2">
                    {/* Room Code */}
                    <div className="flex items-center gap-2">
                      {room.isPrivate ? (
                        <Lock size={16} className="text-muted-foreground" />
                      ) : (
                        <LockOpen size={16} className="text-muted-foreground" />
                      )}
                      <span className="font-mono font-bold text-primary tracking-wider">
                        {room.gameId}
                      </span>
                      {room.isPrivate && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                    </div>

                    {/* Host Name */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={16} />
                      <span>{room.hostName}</span>
                      <Badge variant="outline" className="text-xs">Host</Badge>
                    </div>

                    {/* Player Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users size={16} />
                      <span>{room.playerCount} / {room.maxPlayers}</span>
                      <div className="flex gap-1 ml-1">
                        {Array.from({ length: room.maxPlayers }, (_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < room.playerCount
                                ? 'bg-green-500'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <Button
                    variant={room.playerCount >= room.maxPlayers ? 'secondary' : 'success'}
                    size="sm"
                    onClick={() => handleJoin(room.gameId)}
                    disabled={disabled || room.playerCount >= room.maxPlayers}
                    className="gap-2"
                  >
                    {room.playerCount >= room.maxPlayers ? (
                      <>
                        <Lock size={18} />
                        Full
                      </>
                    ) : (
                      <>
                        <SignIn size={18} />
                        Join
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
