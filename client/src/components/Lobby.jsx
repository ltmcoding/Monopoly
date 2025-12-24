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
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-b-0">
      <span className="text-base font-medium">{label}</span>
      {isHost ? (
        <button
          className={`relative w-14 h-8 rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted'}`}
          onClick={() => handleSettingChange(settingKey, !settings[settingKey])}
          disabled={savingSettings}
        >
          <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${settings[settingKey] ? 'left-7' : 'left-1'}`} />
        </button>
      ) : (
        <Badge variant={settings[settingKey] ? 'default' : 'secondary'} className="text-sm px-3 py-1">
          {settings[settingKey] ? 'ON' : 'OFF'}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header Bar - Monopoly Branding */}
      <header className="flex items-center gap-6 px-8 py-5 mb-6 bg-[#0f1419] rounded-xl border-b-4 border-primary shadow-xl">
        <svg width="48" height="48" viewBox="0 0 100 100" className="text-primary">
          <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
          <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
          <circle cx="50" cy="50" r="12" fill="currentColor"/>
        </svg>
        <span className="text-4xl font-bold tracking-wider game-logo" data-text="MONOPOLY">MONOPOLY</span>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Panel - Chat */}
          <Card className="lg:col-span-1 flex flex-col max-h-[75vh] card-gilded">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <ChatCircle size={28} weight="duotone" className="text-primary" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.length === 0 ? (
                <p className="text-center text-muted-foreground text-base py-12">No messages yet</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`text-base ${msg.type === 'system' ? 'text-muted-foreground italic' : ''}`}>
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
            <form className="flex gap-3" onSubmit={handleSendMessage}>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1 text-base py-3"
              />
              <Button type="submit" size="icon" disabled={!chatInput.trim()} className="h-11 w-11">
                <PaperPlaneTilt size={20} />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Middle Panel - Main Content */}
        <Card className="lg:col-span-2 card-gilded">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <GameController size={42} className="text-primary" weight="duotone" />
                Game Lobby
              </CardTitle>
              {isHost ? (
                <Button variant="outline" size="default" onClick={handleTogglePrivacy} className="gap-2 text-base px-4 py-2">
                  {isPrivate ? <Lock size={20} /> : <LockOpen size={20} />}
                  {isPrivate ? 'Private' : 'Public'}
                </Button>
              ) : isPrivate && (
                <Badge variant="secondary" className="gap-1.5 text-base px-3 py-1">
                  <Lock size={16} />
                  Private
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Game Code */}
            <div className="p-6 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-muted-foreground">Room Code</p>
                  <p className="text-4xl font-mono font-bold text-primary tracking-widest">{gameId}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="default" onClick={handleCopyLink} className="gap-2 text-base px-4">
                    {copiedLink ? <Check size={18} /> : <Link size={18} />}
                    {copiedLink ? 'Copied!' : 'Link'}
                  </Button>
                  <Button variant="outline" size="default" onClick={handleCopyCode} className="gap-2 text-base px-4">
                    {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                    {copiedCode ? 'Copied!' : 'Code'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Gold Divider */}
            <div className="divider-gilded" />

            {/* Players */}
            <div>
              <h3 className="flex items-center gap-3 text-lg font-semibold mb-4 text-muted-foreground">
                <Users size={28} />
                Players ({gameState.players.length})
              </h3>
              <div className="space-y-3">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${player.id === playerId ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30'}`}
                  >
                    <button
                      className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: player.color }}
                      onClick={() => player.id === playerId && setShowColorPicker(true)}
                      disabled={player.id !== playerId}
                    >
                      {player.id === playerId && <Pencil size={16} className="text-white" />}
                    </button>
                    <span className="font-medium flex-1 text-lg">{player.name}</span>
                    {index === 0 && <Badge className="text-sm px-3 py-1">HOST</Badge>}
                    {player.id === playerId && <Badge variant="outline" className="text-sm px-3 py-1">YOU</Badge>}
                    {isHost && player.id !== playerId && (
                      <button
                        className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setKickConfirm(player)}
                      >
                        <X size={18} />
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
              <h3 className="flex items-center gap-3 text-lg font-semibold mb-4 text-muted-foreground">
                <Package size={28} />
                Game Edition
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-3">
                {GAME_EDITIONS.map((edition) => (
                  <button
                    key={edition.id}
                    className={`flex-shrink-0 w-56 rounded-xl overflow-hidden border-2 transition-all ${
                      (settings.gameEdition === edition.id || (edition.id === 'classic' && !settings.gameEdition))
                        ? 'border-primary'
                        : 'border-transparent'
                    } ${!edition.available ? 'opacity-50' : ''}`}
                    onClick={() => edition.available && isHost && handleSettingChange('gameEdition', edition.id)}
                    disabled={!edition.available || !isHost}
                  >
                    <div className="h-32 relative" style={{ background: edition.gradient }}>
                      {!edition.available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Lock size={28} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-card text-center">
                      <p className="text-base font-medium truncate">{edition.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gold Divider */}
            <div className="divider-gilded" />

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-border">
              {isHost ? (
                <Button
                  size="lg"
                  className="flex-1 gap-3 text-lg py-6"
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 2 || starting}
                >
                  {starting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play size={24} weight="fill" />
                      Start Game
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-3 p-5 rounded-xl bg-primary/10 text-primary text-lg">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Waiting for host
                </div>
              )}
              <Button variant="secondary" onClick={handleLeave} className="gap-3 text-base px-6 py-4">
                <SignOut size={20} />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Rules */}
        <Card className="lg:col-span-1 card-gilded">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Gear size={28} weight="duotone" className="text-primary" />
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Max Players */}
              <div className="flex items-center justify-between py-3 px-4 border-b border-border">
                <span className="text-base font-medium">Max Players</span>
                {isHost ? (
                  <select
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-base"
                    value={settings.maxPlayers || 6}
                    onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                    disabled={savingSettings}
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                ) : (
                  <span className="text-base text-primary font-medium">{settings.maxPlayers || 6}</span>
                )}
              </div>

              {/* Starting Cash */}
              <div className="flex items-center justify-between py-3 px-4 border-b border-border">
                <span className="text-base font-medium">Starting Cash</span>
                {isHost ? (
                  showCustomCash ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base">$</span>
                      <input
                        type="number"
                        value={customCashValue}
                        onChange={(e) => setCustomCashValue(e.target.value)}
                        className="w-24 bg-secondary border border-border rounded-lg px-3 py-2 text-base"
                        min="100"
                        max="10000"
                        autoFocus
                      />
                      <button onClick={handleCustomCashSubmit} className="p-1.5 text-green-500"><Check size={18} /></button>
                      <button onClick={() => { setShowCustomCash(false); setCustomCashValue(''); }} className="p-1.5 text-muted-foreground"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isCustomCash && <span className="text-base text-primary mr-1">{formatCurrency(settings.startingCash)}</span>}
                      <select
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-base"
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
                  <span className="text-base text-primary font-medium">{formatCurrency(settings.startingCash)}</span>
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
      </div>

      {/* Kick Confirmation Dialog */}
      <Dialog open={!!kickConfirm} onOpenChange={() => setKickConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Kick Player</DialogTitle>
          </DialogHeader>
          <p className="py-6 text-base">
            Are you sure you want to kick <strong>{kickConfirm?.name}</strong> from the lobby?
          </p>
          <DialogFooter className="gap-3">
            <Button variant="secondary" onClick={() => setKickConfirm(null)} className="text-base px-5 py-2">Cancel</Button>
            <Button variant="destructive" onClick={() => handleKickPlayer(kickConfirm?.id)} className="text-base px-5 py-2">Kick</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Palette size={28} />
              Choose Your Color
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-6">
            {TOKEN_COLORS.map(color => {
              const isUsed = usedColors.includes(color) && color !== currentPlayer?.color;
              const isSelected = color === currentPlayer?.color;
              return (
                <button
                  key={color}
                  className={`aspect-square rounded-xl border-3 flex items-center justify-center transition-all ${
                    isSelected ? 'border-white scale-110' : 'border-transparent'
                  } ${isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => !isUsed && handleColorChange(color)}
                  disabled={isUsed}
                >
                  {isSelected && <Check size={28} className="text-white" />}
                  {isUsed && <X size={24} className="text-white" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
