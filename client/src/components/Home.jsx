import React, { useState } from 'react';
import {
  Play,
  Lock,
  SquaresFour,
  User,
  ArrowClockwise,
  WarningCircle,
  XCircle,
  SignIn
} from '@phosphor-icons/react';
import RoomBrowser from './RoomBrowser';
import { generateRandomName } from '../utils/nameGenerator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';

// Default settings for new games
const DEFAULT_SETTINGS = {
  auctionMode: true,
  noRentInJail: false,
  mortgageMode: true,
  evenBuild: true,
  unlimitedProperties: false,
  startingCash: 1500,
  doubleGoBonus: false,
  freeParking: false,
  maxPlayers: 6
};

export default function Home({ socket, onGameCreated, onGameJoined, urlGameCode, onUrlGameCodeCleared }) {
  const [playerName, setPlayerName] = useState('');
  const [placeholderName, setPlaceholderName] = useState(() => generateRandomName());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(!!urlGameCode);

  // Get the name to use (user input or generated placeholder)
  const getNameToUse = () => playerName.trim() || placeholderName;

  const handleQuickPlay = async () => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.quickPlay(nameToUse, DEFAULT_SETTINGS);

      if (response.created) {
        onGameCreated({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: nameToUse,
          sessionId: response.sessionId,
          isHost: true,
          gameState: response.gameState
        });
      } else {
        onGameJoined({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: nameToUse,
          sessionId: response.sessionId,
          isHost: false,
          gameState: response.gameState
        });
      }
    } catch (err) {
      console.error('Quick play error:', err);
      setError(err.message || 'Failed to find or create game');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateRoom = async () => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.createPrivateRoom(nameToUse, DEFAULT_SETTINGS);

      onGameCreated({
        gameId: response.gameId,
        playerId: response.player.id,
        playerName: nameToUse,
        sessionId: response.sessionId,
        isHost: true,
        gameState: response.gameState,
        isPrivate: true
      });
    } catch (err) {
      console.error('Create private room error:', err);
      setError(err.message || 'Failed to create private room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFromBrowser = async (gameId) => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.joinGame(gameId, nameToUse);

      onGameJoined({
        gameId: gameId,
        playerId: response.player.id,
        playerName: nameToUse,
        sessionId: response.sessionId,
        isHost: response.isHost,
        gameState: response.gameState
      });
    } catch (err) {
      setError(err.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFromUrl = async () => {
    if (!urlGameCode) return;
    await handleJoinFromBrowser(urlGameCode);
  };

  const handleCancelJoinFromUrl = () => {
    setShowJoinPrompt(false);
    if (onUrlGameCodeCleared) onUrlGameCodeCleared();
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-xl border-border card-gilded">
        <CardHeader className="text-center pb-4 pt-8">
          {/* Logo Icon - Game Board */}
          <div className="flex justify-center mb-6">
            <svg width="88" height="88" viewBox="0 0 100 100" className="text-primary">
              <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
              <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="50" r="12" fill="currentColor"/>
            </svg>
          </div>
          <CardTitle className="text-5xl font-bold tracking-wider game-logo" data-text="TYCOON">
            TYCOON
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Build Your Empire
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          {/* Connection Status */}
          {!socket.connected && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <WarningCircle size={20} />
              <span className="text-sm font-medium">Connecting to server...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <XCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User size={18} />
                Your Name
              </Label>
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setPlaceholderName(generateRandomName())}
                title="Generate new random name"
              >
                <ArrowClockwise size={16} />
              </button>
            </div>
            <Input
              type="text"
              placeholder={placeholderName}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              disabled={loading}
              className="h-11"
            />
          </div>

          {/* Main Actions */}
          <div className="space-y-4">
            {/* Play Button */}
            <Button
              size="xl"
              className="w-full gap-3 text-lg"
              onClick={handleQuickPlay}
              disabled={!socket.connected || loading}
            >
              <Play size={24} weight="fill" />
              {loading ? 'Finding Game...' : 'Play'}
            </Button>

            {/* Secondary Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={handleCreatePrivateRoom}
                disabled={!socket.connected || loading}
              >
                <Lock size={20} />
                Private Room
              </Button>
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={() => setShowRoomBrowser(true)}
                disabled={!socket.connected || loading}
              >
                <SquaresFour size={20} />
                Room Browser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Browser Modal */}
      {showRoomBrowser && (
        <RoomBrowser
          socket={socket}
          playerName={getNameToUse()}
          onJoin={handleJoinFromBrowser}
          onClose={() => setShowRoomBrowser(false)}
          disabled={loading}
        />
      )}

      {/* Join from URL Dialog */}
      <Dialog open={showJoinPrompt && !!urlGameCode} onOpenChange={(open) => !open && handleCancelJoinFromUrl()}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 text-primary mb-2">
              <SignIn size={32} />
              <DialogTitle className="text-xl">Join Game</DialogTitle>
            </div>
            <DialogDescription>
              You've been invited to join a game
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Game Code Display */}
            <div className="text-center">
              <span className="text-3xl font-mono font-bold text-primary tracking-widest">
                {urlGameCode}
              </span>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                type="text"
                placeholder={placeholderName}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                <XCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={handleCancelJoinFromUrl}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinFromUrl}
              disabled={!socket.connected || loading}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
