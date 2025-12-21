import React, { useState, useEffect, useRef } from 'react';
import {
  ChatCircle,
  PaperPlaneTilt,
  GameController,
  Lock,
  LockOpen,
  Users,
  Gear,
  Play,
  SignOut,
  Link,
  Copy,
  Check,
  X,
  Pencil,
  Palette,
  Package
} from '@phosphor-icons/react';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';

// 16 player token colors - Sophisticated muted palette with gradients
// Each color has a main color and will render with a gradient in-game
const TOKEN_COLORS = [
  '#c45c5c',  // Dusty Rose
  '#d4896a',  // Terracotta
  '#c9a855',  // Antique Gold
  '#6b9b6b',  // Sage Green
  '#5a9e9e',  // Seafoam Teal
  '#6888a5',  // Slate Blue
  '#7c7cb5',  // Periwinkle
  '#9a7bb5',  // Lavender
  '#b56e8a',  // Mauve
  '#8b8b9a',  // Cool Gray
  '#7a6b5a',  // Taupe
  '#8a7355',  // Bronze
  '#5a7a6a',  // Forest Mist
  '#5a6a8a',  // Dusk Blue
  '#8a5a6a',  // Burgundy Mist
  '#6a5a7a',  // Plum
];

// Game Edition data
const GAME_EDITIONS = [
  { id: 'classic', name: 'Classic', description: 'The original Monopoly experience', available: true, gradient: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 25%, #1a1a2e 50%, #006400 75%, #004d00 100%)' },
  { id: 'speed-die', name: 'Speed Die', description: 'Faster gameplay with the speed die', available: false, gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%)' },
  { id: 'mega-monopoly', name: 'Mega Monopoly', description: 'Larger board, more properties', available: false, gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4776e6 100%)' },
  { id: 'buy-everything', name: 'Buy Everything', description: 'Purchase any space on the board', available: false, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #00d084 100%)' }
];

const CASH_PRESETS = [500, 1000, 1500, 2000, 2500, 3000];

export default function Lobby({ socket, gameId, playerId, gameState, isHost, onGameStarted, onLeave }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [settings, setSettings] = useState(gameState.settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState(gameState.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [showCustomCash, setShowCustomCash] = useState(false);
  const [customCashValue, setCustomCashValue] = useState('');
  const [kickConfirm, setKickConfirm] = useState(null);
  const [isPrivate, setIsPrivate] = useState(gameState.isPrivate || false);
  const chatEndRef = useRef(null);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const usedColors = gameState.players.map(p => p.color);
  const isCustomCash = !CASH_PRESETS.includes(settings.startingCash);

  const getGameLink = () => `${window.location.origin}/${gameId}`;

  useEffect(() => {
    const handleChatMessage = ({ chatMessage }) => setChatMessages(prev => [...prev.slice(-49), chatMessage]);
    const handlePrivacyToggled = ({ systemMessage, gameState: newState, isPrivate: newPrivacy }) => {
      if (systemMessage) setChatMessages(prev => [...prev.slice(-49), systemMessage]);
      setSettings(newState.settings);
      setIsPrivate(newPrivacy);
    };
    const handlePlayerJoined = ({ systemMessage }) => { if (systemMessage) setChatMessages(prev => [...prev.slice(-49), systemMessage]); };
    const handlePlayerLeft = ({ systemMessage }) => { if (systemMessage) setChatMessages(prev => [...prev.slice(-49), systemMessage]); };
    const handlePlayerKicked = ({ systemMessage }) => { if (systemMessage) setChatMessages(prev => [...prev.slice(-49), systemMessage]); };
    const handleKicked = () => { alert('You were kicked from the lobby'); onLeave(); };

    socket.on('chatMessageReceived', handleChatMessage);
    socket.on('privacyToggled', handlePrivacyToggled);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('playerKicked', handlePlayerKicked);
    socket.on('kicked', handleKicked);

    return () => {
      socket.off('chatMessageReceived', handleChatMessage);
      socket.off('privacyToggled', handlePrivacyToggled);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('playerKicked', handlePlayerKicked);
      socket.off('kicked', handleKicked);
    };
  }, [socket, onLeave]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { setSettings(gameState.settings); }, [gameState.settings]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getGameLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(gameId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartGame = async () => {
    if (gameState.players.length < 2) { alert('Need at least 2 players to start'); return; }
    setStarting(true);
    try {
      await socket.startGame(gameId);
      onGameStarted();
    } catch (err) {
      alert(err.message || 'Failed to start game');
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    try { await socket.leaveGame(gameId); onLeave(); } catch (err) { console.error('Failed to leave:', err); }
  };

  const handleColorChange = async (color) => {
    try { await socket.changePlayerColor(gameId, color); setShowColorPicker(false); } catch (err) { alert(err.message || 'Failed to change color'); }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSavingSettings(true);
    try { await socket.updateSettings(gameId, newSettings); } catch (err) { setSettings(gameState.settings); } finally { setSavingSettings(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try { await socket.sendChatMessage(gameId, chatInput.trim()); setChatInput(''); } catch (err) { console.error('Failed to send message:', err); }
  };

  const handleTogglePrivacy = async () => {
    try { await socket.togglePrivacy(gameId); } catch (err) { alert(err.message || 'Failed to toggle privacy'); }
  };

  const handleKickPlayer = async (targetSocketId) => {
    try { await socket.kickPlayer(gameId, targetSocketId); setKickConfirm(null); } catch (err) { alert(err.message || 'Failed to kick player'); }
  };

  const handleStartingCashChange = (value) => {
    if (value === 'custom') { setShowCustomCash(true); return; }
    handleSettingChange('startingCash', parseInt(value));
  };

  const handleCustomCashSubmit = () => {
    const value = parseInt(customCashValue);
    if (value >= 100 && value <= 10000) { handleSettingChange('startingCash', value); setShowCustomCash(false); setCustomCashValue(''); }
    else { alert('Value must be between $100 and $10,000'); }
  };

  const SettingToggle = ({ label, settingKey }) => (
    <div className="flex items-center justify-between py-2 px-3 border-b border-border last:border-b-0">
      <span className="text-sm font-medium">{label}</span>
      {isHost ? (
        <button
          className={`relative w-11 h-6 rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted'}`}
          onClick={() => handleSettingChange(settingKey, !settings[settingKey])}
          disabled={savingSettings}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[settingKey] ? 'left-6' : 'left-1'}`} />
        </button>
      ) : (
        <Badge variant={settings[settingKey] ? 'default' : 'secondary'}>
          {settings[settingKey] ? 'ON' : 'OFF'}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header Bar - Monopoly Branding */}
      <header className="flex items-center gap-4 px-5 py-3 mb-4 bg-[#1a1f26] rounded-lg border-b-2 border-primary/30 shadow-lg">
        <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary">
          <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
          <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <circle cx="50" cy="50" r="12" fill="currentColor"/>
        </svg>
        <span className="text-2xl font-bold tracking-wider game-logo" data-text="MONOPOLY">MONOPOLY</span>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex items-start py-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Left Panel - Chat */}
          <Card className="lg:col-span-1 flex flex-col max-h-[70vh] card-gilded">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <ChatCircle size={20} weight="duotone" className="text-primary" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {chatMessages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No messages yet</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-muted-foreground italic' : ''}`}>
                    {msg.type === 'player' ? (
                      <>
                        <span className="font-semibold" style={{ color: msg.playerColor }}>{msg.playerName}</span>
                        <span className="text-foreground ml-2">{msg.message}</span>
                      </>
                    ) : (
                      <span>{msg.message}</span>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="flex gap-2" onSubmit={handleSendMessage}>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!chatInput.trim()}>
                <PaperPlaneTilt size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Middle Panel - Main Content */}
        <Card className="lg:col-span-2 card-gilded">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <GameController size={32} className="text-primary" weight="duotone" />
                Game Lobby
              </CardTitle>
              {isHost ? (
                <Button variant="outline" size="sm" onClick={handleTogglePrivacy} className="gap-2">
                  {isPrivate ? <Lock size={16} /> : <LockOpen size={16} />}
                  {isPrivate ? 'Private' : 'Public'}
                </Button>
              ) : isPrivate && (
                <Badge variant="secondary" className="gap-1">
                  <Lock size={12} />
                  Private
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Code */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Room Code</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-widest">{gameId}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
                    {copiedLink ? <Check size={14} /> : <Link size={14} />}
                    {copiedLink ? 'Copied!' : 'Link'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? 'Copied!' : 'Code'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Gold Divider */}
            <div className="divider-gilded" />

            {/* Players */}
            <div>
              <h3 className="flex items-center gap-2.5 text-base font-semibold mb-3 text-muted-foreground">
                <Users size={20} />
                Players ({gameState.players.length})
              </h3>
              <div className="space-y-2">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${player.id === playerId ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30'}`}
                  >
                    <button
                      className="w-9 h-9 rounded-full border-2 border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: player.color }}
                      onClick={() => player.id === playerId && setShowColorPicker(true)}
                      disabled={player.id !== playerId}
                    >
                      {player.id === playerId && <Pencil size={12} className="text-white" />}
                    </button>
                    <span className="font-medium flex-1">{player.name}</span>
                    {index === 0 && <Badge>HOST</Badge>}
                    {player.id === playerId && <Badge variant="outline">YOU</Badge>}
                    {isHost && player.id !== playerId && (
                      <button
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setKickConfirm(player)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gold Divider */}
            <div className="divider-gilded" />

            {/* Game Edition */}
            <div>
              <h3 className="flex items-center gap-2.5 text-base font-semibold mb-3 text-muted-foreground">
                <Package size={20} />
                Game Edition
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {GAME_EDITIONS.map((edition) => (
                  <button
                    key={edition.id}
                    className={`flex-shrink-0 w-40 rounded-lg overflow-hidden border-2 transition-all ${
                      (settings.gameEdition === edition.id || (edition.id === 'classic' && !settings.gameEdition))
                        ? 'border-primary'
                        : 'border-transparent'
                    } ${!edition.available ? 'opacity-50' : ''}`}
                    onClick={() => edition.available && isHost && handleSettingChange('gameEdition', edition.id)}
                    disabled={!edition.available || !isHost}
                  >
                    <div className="h-24 relative" style={{ background: edition.gradient }}>
                      {!edition.available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Lock size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-card text-center">
                      <p className="text-sm font-medium truncate">{edition.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gold Divider */}
            <div className="divider-gilded" />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {isHost ? (
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 2 || starting}
                >
                  {starting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play size={18} weight="fill" />
                      Start Game
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Waiting for host
                </div>
              )}
              <Button variant="secondary" onClick={handleLeave} className="gap-2">
                <SignOut size={16} />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Rules */}
        <Card className="lg:col-span-1 card-gilded">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <Gear size={20} weight="duotone" className="text-primary" />
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              {/* Max Players */}
              <div className="flex items-center justify-between py-2 px-3 border-b border-border">
                <span className="text-sm font-medium">Max Players</span>
                {isHost ? (
                  <select
                    className="bg-secondary border border-border rounded px-2 py-1 text-sm"
                    value={settings.maxPlayers || 6}
                    onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                    disabled={savingSettings}
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                ) : (
                  <span className="text-sm text-primary font-medium">{settings.maxPlayers || 6}</span>
                )}
              </div>

              {/* Starting Cash */}
              <div className="flex items-center justify-between py-2 px-3 border-b border-border">
                <span className="text-sm font-medium">Starting Cash</span>
                {isHost ? (
                  showCustomCash ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        value={customCashValue}
                        onChange={(e) => setCustomCashValue(e.target.value)}
                        className="w-20 bg-secondary border border-border rounded px-2 py-1 text-sm"
                        min="100"
                        max="10000"
                        autoFocus
                      />
                      <button onClick={handleCustomCashSubmit} className="p-1 text-green-500"><Check size={14} /></button>
                      <button onClick={() => { setShowCustomCash(false); setCustomCashValue(''); }} className="p-1 text-muted-foreground"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {isCustomCash && <span className="text-sm text-primary mr-1">{formatCurrency(settings.startingCash)}</span>}
                      <select
                        className="bg-secondary border border-border rounded px-2 py-1 text-sm"
                        value={isCustomCash ? 'custom' : settings.startingCash}
                        onChange={(e) => handleStartingCashChange(e.target.value)}
                        disabled={savingSettings}
                      >
                        {CASH_PRESETS.map(amount => <option key={amount} value={amount}>{formatCurrency(amount)}</option>)}
                        <option value="custom">Custom...</option>
                      </select>
                    </div>
                  )
                ) : (
                  <span className="text-sm text-primary font-medium">{formatCurrency(settings.startingCash)}</span>
                )}
              </div>

              <SettingToggle label="Auction Mode" settingKey="auctionMode" />
              <SettingToggle label="Double GO Bonus" settingKey="doubleGoBonus" />
              <SettingToggle label="No Rent in Jail" settingKey="noRentInJail" />
              <SettingToggle label="Mortgage Mode" settingKey="mortgageMode" />
              <SettingToggle label="Even Build" settingKey="evenBuild" />
              <SettingToggle label="Free Parking Jackpot" settingKey="freeParking" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kick Confirmation Dialog */}
      <Dialog open={!!kickConfirm} onOpenChange={() => setKickConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick Player</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to kick <strong>{kickConfirm?.name}</strong> from the lobby?
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setKickConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleKickPlayer(kickConfirm?.id)}>Kick</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette size={20} />
              Choose Your Color
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {TOKEN_COLORS.map(color => {
              const isUsed = usedColors.includes(color) && color !== currentPlayer?.color;
              const isSelected = color === currentPlayer?.color;
              return (
                <button
                  key={color}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-white scale-110' : 'border-transparent'
                  } ${isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => !isUsed && handleColorChange(color)}
                  disabled={isUsed}
                >
                  {isSelected && <Check size={20} className="text-white" />}
                  {isUsed && <X size={16} className="text-white" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
