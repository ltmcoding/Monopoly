import React, { useState, useEffect, useRef } from 'react';
import { BOARD_SPACES, COLOR_MAP, getSpaceById } from '../utils/boardData';

// Enhanced property colors (vibrant for dark mode)
const ENHANCED_COLORS = {
  brown: '#8B4513',
  lightblue: '#5DADE2',
  pink: '#E066A6',
  orange: '#E67E22',
  red: '#E74C3C',
  yellow: '#F4D03F',
  green: '#27AE60',
  darkblue: '#2E86AB',
  railroad: '#4a4a4a',
  utility: '#6c757d'
};

// Dark mode tile colors
const TILE_COLORS = {
  background: '#1a1f25',
  backgroundCorner: '#151a1f',
  text: '#e6edf3',
  textMuted: '#8b949e',
  price: '#d4a932',
  border: '#c9a227',
  borderDark: '#8b7355',
};

// Wood colors for borders - darker shades
const WOOD_COLORS = {
  light: '#5c3d1e',
  medium: '#4a2f17',
  dark: '#2d1a0e',
  grain1: '#5a3518',
  grain2: '#3d2512',
};

// Dice pip positions
const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.5], [0.72, 0.5], [0.28, 0.72], [0.72, 0.72]],
};

// Truncate long names
const truncate = (str, max = 8) => {
  if (str.length <= max) return str;
  return str.substring(0, max - 1) + '.';
};

// Dice face component
const DiceFace = ({ value, size, isRolling }) => {
  const pips = PIP_POSITIONS[value] || [];
  const pipRadius = size * 0.09;

  return (
    <g className={isRolling ? 'dice-rolling' : ''}>
      <rect x={-size/2 + 3} y={-size/2 + 3} width={size} height={size} fill="rgba(0,0,0,0.3)" rx={size * 0.18}/>
      <rect x={-size/2} y={-size/2} width={size} height={size} fill="url(#diceGradient)" stroke="#ccc" strokeWidth="2" rx={size * 0.18}/>
      {pips.map(([px, py], idx) => (
        <circle key={idx} cx={-size/2 + px * size} cy={-size/2 + py * size} r={pipRadius} fill="#1a1a1a"/>
      ))}
    </g>
  );
};

// Speed die face
const SpeedDieFace = ({ value, size }) => (
  <g>
    <rect x={-size/2 + 2} y={-size/2 + 2} width={size} height={size} fill="rgba(0,0,0,0.3)" rx={size * 0.18}/>
    <rect x={-size/2} y={-size/2} width={size} height={size} fill="#2ecc71" stroke="#27ae60" strokeWidth="2" rx={size * 0.18}/>
    {typeof value === 'number' ? (
      PIP_POSITIONS[value]?.map(([px, py], idx) => (
        <circle key={idx} cx={-size/2 + px * size} cy={-size/2 + py * size} r={size * 0.09} fill="#fff"/>
      ))
    ) : value === 'Bus' ? (
      <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.35} fill="#fff" fontWeight="bold">🚌</text>
    ) : (
      <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.3} fill="#fff" fontWeight="bold">🎩</text>
    )}
  </g>
);

// Corner renderers with real emojis
const renderGoCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx={4}/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.22} textAnchor="middle" fontSize={size*0.16} fill="#e74c3c" fontWeight="bold">GO</text>
      <text y={size*0.08} textAnchor="middle" fontSize={size*0.22}>➡️</text>
      <text y={size*0.32} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.price} fontWeight="bold">COLLECT $200</text>
    </g>
  </g>
);

// Fixed Jail corner - larger text, JUST rotated 180, no border between sections
const renderJailCorner = (size) => {
  const jailSize = size * 0.62;
  const visitingWidth = size - jailSize;

  return (
    <g>
      {/* Main background */}
      <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx={4}/>

      {/* Jail cell in top-right */}
      <g transform={`translate(${visitingWidth}, 0)`}>
        <rect width={jailSize} height={jailSize} fill="#2d2d2d" stroke="#666" strokeWidth="3"/>
        {/* Jail bars */}
        {[0.2, 0.4, 0.6, 0.8].map((xPos, i) => (
          <line key={i} x1={jailSize * xPos} y1={0} x2={jailSize * xPos} y2={jailSize} stroke="#888" strokeWidth="4" strokeLinecap="round"/>
        ))}
        <text x={jailSize/2} y={jailSize/2 + 4} textAnchor="middle" fontSize={size*0.08} fill="#f59e0b" fontWeight="bold">IN JAIL</text>
      </g>

      {/* "JUST" text on left strip - rotated 90 degrees (reads top to bottom) */}
      <g transform={`translate(${visitingWidth/2}, ${size/2}) rotate(90)`}>
        <text textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">JUST</text>
      </g>

      {/* "VISITING" text on bottom strip - larger */}
      <text x={size/2 + visitingWidth/4} y={size - size*0.08} textAnchor="middle" fontSize={size*0.085} fill={TILE_COLORS.text} fontWeight="bold">VISITING</text>

      {/* Only border around jail cell, not between JUST and VISITING */}
      <line x1={visitingWidth} y1={0} x2={visitingWidth} y2={jailSize} stroke={TILE_COLORS.border} strokeWidth="2"/>
      <line x1={visitingWidth} y1={jailSize} x2={size} y2={jailSize} stroke={TILE_COLORS.border} strokeWidth="2"/>
    </g>
  );
};

const renderFreeParkingCorner = (size, potAmount = 0) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx={4}/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.28} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.text} fontWeight="bold">FREE</text>
      <text y={-size*0.14} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.text} fontWeight="bold">PARKING</text>
      <text y={size*0.12} textAnchor="middle" fontSize={size*0.25}>🅿️</text>
      {potAmount > 0 && (
        <text y={size*0.36} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.price} fontWeight="bold">${potAmount}</text>
      )}
    </g>
  </g>
);

const renderGoToJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx={4}/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.28} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.text} fontWeight="bold">GO TO</text>
      <text y={-size*0.14} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.text} fontWeight="bold">JAIL</text>
      <text y={size*0.15} textAnchor="middle" fontSize={size*0.25}>👮</text>
    </g>
  </g>
);

export default function Board2D({
  gameState,
  onRollDice,
  isMyTurn = false,
  canRoll = false,
  myPlayerId = null,
  socket = null,
  gameId = null
}) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(950);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(gameState?.dice || [1, 1]);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.game-center');
      if (container) {
        const maxSize = Math.min(container.clientWidth - 20, container.clientHeight - 20, 1050);
        setBoardSize(Math.max(maxSize, 750));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (gameState?.dice && !isRolling) {
      setDisplayDice(gameState.dice);
    }
  }, [gameState?.dice, isRolling]);

  // Sizing calculations
  const woodBorderWidth = Math.round(boardSize * 0.022);
  const cornerSize = Math.round(boardSize * 0.135);
  const colorBarHeight = Math.round(boardSize * 0.028);
  const sideSpaces = 9;
  const spaceWidth = Math.floor((boardSize - 2 * cornerSize - 2 * woodBorderWidth) / sideSpaces);
  const innerBoardStart = cornerSize + woodBorderWidth;
  const innerBoardSize = boardSize - 2 * cornerSize - 2 * woodBorderWidth;
  const fontSize = Math.round(boardSize * 0.009);
  const priceFontSize = Math.round(boardSize * 0.01);

  // Consistent spacing for all tile orientations
  const textGap = fontSize * 1.8;        // Gap from color bar to first line of text
  const priceGap = fontSize * 1.0;       // Gap from edge to price

  const getSpacePosition = (position) => {
    const offset = woodBorderWidth;
    if (position === 0) {
      return { x: boardSize - cornerSize - offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 0 && position < 10) {
      return { x: boardSize - cornerSize - offset - (position * spaceWidth), y: boardSize - cornerSize - offset, w: spaceWidth, h: cornerSize, side: 'bottom' };
    } else if (position === 10) {
      return { x: offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 10 && position < 20) {
      const idx = position - 10;
      return { x: offset, y: boardSize - cornerSize - offset - (idx * spaceWidth), w: cornerSize, h: spaceWidth, side: 'left' };
    } else if (position === 20) {
      return { x: offset, y: offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 20 && position < 30) {
      const idx = position - 20;
      return { x: cornerSize + offset + ((idx - 1) * spaceWidth), y: offset, w: spaceWidth, h: cornerSize, side: 'top' };
    } else if (position === 30) {
      return { x: boardSize - cornerSize - offset, y: offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else {
      const idx = position - 30;
      return { x: boardSize - cornerSize - offset, y: cornerSize + offset + ((idx - 1) * spaceWidth), w: cornerSize, h: spaceWidth, side: 'right' };
    }
  };

  const getPlayersOnSpace = (position) => gameState.players.filter(p => p.position === position && !p.isBankrupt);
  const getPropertyState = (space) => (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') ? gameState.properties[space.id] : null;
  const getOwnerColor = (ownerId) => gameState.players.find(p => p.id === ownerId)?.color || '#666';

  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;
    setIsRolling(true);
    const animationDuration = 1000;
    const frameInterval = 100;
    let elapsed = 0;
    const animateInterval = setInterval(() => {
      setDisplayDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      elapsed += frameInterval;
      if (elapsed >= animationDuration) clearInterval(animateInterval);
    }, frameInterval);
    if (onRollDice) {
      try { await onRollDice(); }
      finally { setTimeout(() => setIsRolling(false), animationDuration); }
    } else {
      setTimeout(() => setIsRolling(false), animationDuration);
    }
  };

  const handleDebugAddCash = async (amount) => {
    if (socket && gameId) socket.emit('debugAddCash', { gameId, amount });
  };

  const handleDebugAddProperty = async (propertyId) => {
    if (socket && gameId) socket.emit('debugAddProperty', { gameId, propertyId });
  };

  // Simplified hover - just set/clear state directly
  const handleMouseEnter = (spaceId) => {
    setHoveredSpace(spaceId);
  };

  const handleMouseLeave = () => {
    // Don't clear immediately - let renderHoverCard handle it
  };

  // Handle property actions from hover card
  const handlePropertyAction = async (action, propertyId) => {
    if (!socket || actionLoading) return;
    setActionLoading(true);
    const currentHovered = hoveredSpace;
    try {
      await socket[action](gameId, propertyId);
      // Force hover card refresh by briefly clearing and resetting
      // This ensures the card re-reads from updated gameState
      setHoveredSpace(null);
      setTimeout(() => setHoveredSpace(currentHovered), 100);
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Bottom tile (color bar top, name below color bar, price at bottom)
  const renderBottomTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const isMortgaged = propertyState?.mortgaged;
    const name1 = truncate(space.name.split(' ')[0].toUpperCase(), 9);
    const name2 = space.name.split(' ').length > 1 ? truncate(space.name.split(' ').slice(1).join(' ').toUpperCase(), 9) : '';

    return (
      <g>
        {/* Background with default gold border */}
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        {/* Color bar - greyed out if mortgaged */}
        {space.color && (
          <rect x={0} y={0} width={pos.w} height={colorBarHeight} fill={isMortgaged ? '#555' : color}/>
        )}
        {/* MORTGAGED text on color bar */}
        {isMortgaged && (
          <text x={pos.w/2} y={colorBarHeight * 0.7} textAnchor="middle" fontSize={colorBarHeight * 0.5} fill="#ef4444" fontWeight="bold">MORTGAGED</text>
        )}
        <text x={pos.w/2} y={colorBarHeight + textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name1}</text>
        {name2 && <text x={pos.w/2} y={colorBarHeight + textGap + fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name2}</text>}
        {space.price && <text x={pos.w/2} y={pos.h - priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">${space.price}</text>}
        {renderBuildings(propertyState, pos, 'bottom')}
      </g>
    );
  };

  // Top tile (mirrored - price at top, name above color bar, color bar at bottom)
  const renderTopTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const isMortgaged = propertyState?.mortgaged;
    const name1 = truncate(space.name.split(' ')[0].toUpperCase(), 9);
    const name2 = space.name.split(' ').length > 1 ? truncate(space.name.split(' ').slice(1).join(' ').toUpperCase(), 9) : '';

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        {space.color && (
          <rect x={0} y={pos.h - colorBarHeight} width={pos.w} height={colorBarHeight} fill={isMortgaged ? '#555' : color}/>
        )}
        {isMortgaged && (
          <text x={pos.w/2} y={pos.h - colorBarHeight * 0.3} textAnchor="middle" fontSize={colorBarHeight * 0.5} fill="#ef4444" fontWeight="bold">MORTGAGED</text>
        )}
        {space.price && <text x={pos.w/2} y={priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">${space.price}</text>}
        <text x={pos.w/2} y={pos.h - colorBarHeight - textGap - fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name1}</text>
        {name2 && <text x={pos.w/2} y={pos.h - colorBarHeight - textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name2}</text>}
        {renderBuildings(propertyState, pos, 'top')}
      </g>
    );
  };

  // Left tile - text near color bar (right edge), price at outer edge (left)
  // Mirror of bottom tile layout but rotated 90 degrees
  const renderLeftTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const isMortgaged = propertyState?.mortgaged;
    const name1 = truncate(space.name.split(' ')[0].toUpperCase(), 9);
    const name2 = space.name.split(' ').length > 1 ? truncate(space.name.split(' ').slice(1).join(' ').toUpperCase(), 9) : '';

    // Color bar on RIGHT edge (toward board center)
    // Use same spacing as top/bottom tiles for consistency
    const textCenterX = pos.w - colorBarHeight - textGap;

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        {space.color && (
          <rect x={pos.w - colorBarHeight} y={0} width={colorBarHeight} height={pos.h} fill={isMortgaged ? '#555' : color}/>
        )}
        {isMortgaged && (
          <g transform={`translate(${pos.w - colorBarHeight/2}, ${pos.h/2}) rotate(90)`}>
            <text textAnchor="middle" fontSize={colorBarHeight * 0.5} fill="#ef4444" fontWeight="bold">MORTGAGED</text>
          </g>
        )}
        <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name1}</text>
          {name2 && <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name2}</text>}
        </g>
        {/* Price at outer edge (left side) */}
        <g transform={`translate(${priceGap + priceFontSize * 0.3}, ${pos.h/2}) rotate(90)`}>
          {space.price && <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">${space.price}</text>}
        </g>
        {renderBuildings(propertyState, pos, 'left')}
      </g>
    );
  };

  // Right tile - text near color bar (left edge), price at outer edge (right)
  // Mirror of bottom tile layout but rotated -90 degrees
  const renderRightTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const isMortgaged = propertyState?.mortgaged;
    const name1 = truncate(space.name.split(' ')[0].toUpperCase(), 9);
    const name2 = space.name.split(' ').length > 1 ? truncate(space.name.split(' ').slice(1).join(' ').toUpperCase(), 9) : '';

    // Color bar on LEFT edge (toward board center)
    // Use same spacing as top/bottom tiles for consistency
    const textCenterX = colorBarHeight + textGap;

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        {space.color && (
          <rect x={0} y={0} width={colorBarHeight} height={pos.h} fill={isMortgaged ? '#555' : color}/>
        )}
        {isMortgaged && (
          <g transform={`translate(${colorBarHeight/2}, ${pos.h/2}) rotate(-90)`}>
            <text textAnchor="middle" fontSize={colorBarHeight * 0.5} fill="#ef4444" fontWeight="bold">MORTGAGED</text>
          </g>
        )}
        <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(-90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name1}</text>
          {name2 && <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name2}</text>}
        </g>
        {/* Price at outer edge (right side) */}
        <g transform={`translate(${pos.w - priceGap - priceFontSize * 0.3}, ${pos.h/2}) rotate(-90)`}>
          {space.price && <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">${space.price}</text>}
        </g>
        {renderBuildings(propertyState, pos, 'right')}
      </g>
    );
  };

  // Special bottom - centered emoji, text at same position as properties
  const renderSpecialBottom = (space, pos) => {
    let emoji = '', label1 = '', label2 = '';
    if (space.type === 'chance') { emoji = '❓'; label1 = 'CHANCE'; }
    else if (space.type === 'community_chest') { emoji = '💰'; label1 = 'COMM.'; label2 = 'CHEST'; }
    else if (space.type === 'tax') { emoji = '💎'; label1 = truncate(space.name.toUpperCase(), 10); label2 = `$${space.amount}`; }

    // Income tax ($200) uses white text, luxury tax uses gold
    const taxPriceColor = space.amount === 200 ? '#ffffff' : TILE_COLORS.price;

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        <text x={pos.w/2} y={colorBarHeight + textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label1}</text>
        {label2 && <text x={pos.w/2} y={colorBarHeight + textGap + fontSize * 1.2} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? taxPriceColor : TILE_COLORS.text} fontWeight="bold">{label2}</text>}
        <text x={pos.w/2} y={pos.h * 0.68} textAnchor="middle" fontSize={pos.h * 0.2}>{emoji}</text>
      </g>
    );
  };

  // Special top - mirrored layout with emoji closer to name (toward bottom)
  const renderSpecialTop = (space, pos) => {
    let emoji = '', label1 = '', label2 = '';
    if (space.type === 'chance') { emoji = '❓'; label1 = 'CHANCE'; }
    else if (space.type === 'community_chest') { emoji = '💰'; label1 = 'COMM.'; label2 = 'CHEST'; }
    else if (space.type === 'tax') { emoji = '💎'; label1 = truncate(space.name.toUpperCase(), 10); label2 = `$${space.amount}`; }

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        <text x={pos.w/2} y={pos.h * 0.5} textAnchor="middle" fontSize={pos.h * 0.2}>{emoji}</text>
        <text x={pos.w/2} y={pos.h - colorBarHeight - textGap - fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label1}</text>
        {label2 && <text x={pos.w/2} y={pos.h - colorBarHeight - textGap} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">{label2}</text>}
      </g>
    );
  };

  // Special left - rotated, text aligned with property tiles (account for color bar space)
  const renderSpecialLeft = (space, pos) => {
    let emoji = '', label1 = '', label2 = '';
    if (space.type === 'chance') { emoji = '❓'; label1 = 'CHANCE'; }
    else if (space.type === 'community_chest') { emoji = '💰'; label1 = 'COMM.'; label2 = 'CHEST'; }
    else if (space.type === 'tax') { emoji = '💎'; label1 = truncate(space.name.toUpperCase(), 10); label2 = `$${space.amount}`; }

    // Text position aligned with property tiles
    const textCenterX = pos.w - colorBarHeight - textGap;
    // Icon positioned to not overlap with text (shifted toward outer edge)
    const iconCenterX = pos.w * 0.35;

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label1}</text>
          {label2 && <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label2}</text>}
        </g>
        {/* Emoji positioned away from text to avoid overlap */}
        <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.2}>{emoji}</text>
        </g>
      </g>
    );
  };

  // Special right - rotated, text aligned with property tiles (account for color bar space)
  const renderSpecialRight = (space, pos) => {
    let emoji = '', label1 = '', label2 = '';
    if (space.type === 'chance') { emoji = '❓'; label1 = 'CHANCE'; }
    else if (space.type === 'community_chest') { emoji = '💰'; label1 = 'COMM.'; label2 = 'CHEST'; }
    else if (space.type === 'tax') { emoji = '💎'; label1 = truncate(space.name.toUpperCase(), 10); label2 = `$${space.amount}`; }

    // Text position aligned with property tiles
    const textCenterX = colorBarHeight + textGap;
    // Icon positioned to not overlap with text (shifted toward outer edge)
    const iconCenterX = pos.w * 0.65;

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
        <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(-90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label1}</text>
          {label2 && <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{label2}</text>}
        </g>
        {/* Emoji positioned away from text to avoid overlap */}
        <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(-90)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.2}>{emoji}</text>
        </g>
      </g>
    );
  };

  // Railroad renderers - positioned like property tiles
  const renderRailroad = (space, pos, side, propertyState) => {
    const firstWord = truncate(space.name.split(' ')[0].toUpperCase(), 8);
    const isMortgaged = propertyState?.mortgaged;

    if (side === 'bottom') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <text x={pos.w/2} y={colorBarHeight + textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{firstWord}</text>
          <text x={pos.w/2} y={colorBarHeight + textGap + fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">R.R.</text>
          <text x={pos.w/2} y={pos.h * 0.62} textAnchor="middle" fontSize={pos.h * 0.18}>{isMortgaged ? '🚫' : '🚂'}</text>
          <text x={pos.w/2} y={pos.h - priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          {isMortgaged && <text x={pos.w/2} y={pos.h * 0.4} textAnchor="middle" fontSize={fontSize * 0.8} fill="#ef4444" fontWeight="bold">MORTGAGED</text>}
        </g>
      );
    } else if (side === 'top') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <text x={pos.w/2} y={priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          <text x={pos.w/2} y={pos.h * 0.5} textAnchor="middle" fontSize={pos.h * 0.18}>{isMortgaged ? '🚫' : '🚂'}</text>
          <text x={pos.w/2} y={pos.h - colorBarHeight - textGap - fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{firstWord}</text>
          <text x={pos.w/2} y={pos.h - colorBarHeight - textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">R.R.</text>
          {isMortgaged && <text x={pos.w/2} y={pos.h * 0.65} textAnchor="middle" fontSize={fontSize * 0.8} fill="#ef4444" fontWeight="bold">MORTGAGED</text>}
        </g>
      );
    } else if (side === 'left') {
      // Left side: text aligned with property tiles, icon positioned to avoid overlap
      const textCenterX = pos.w - colorBarHeight - textGap;
      const iconCenterX = pos.w * 0.4;
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{firstWord}</text>
            <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">R.R.</text>
          </g>
          <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.18}>{isMortgaged ? '🚫' : '🚂'}</text>
          </g>
          <g transform={`translate(${priceGap + priceFontSize * 0.3}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          </g>
          {isMortgaged && <g transform={`translate(${pos.w - colorBarHeight/2}, ${pos.h/2}) rotate(90)`}><text textAnchor="middle" fontSize={fontSize * 0.7} fill="#ef4444" fontWeight="bold">MORTGAGED</text></g>}
        </g>
      );
    } else {
      // Right side: text aligned with property tiles, icon positioned to avoid overlap
      const textCenterX = colorBarHeight + textGap;
      const iconCenterX = pos.w * 0.6;
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{firstWord}</text>
            <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">R.R.</text>
          </g>
          <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.18}>{isMortgaged ? '🚫' : '🚂'}</text>
          </g>
          <g transform={`translate(${pos.w - priceGap - priceFontSize * 0.3}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          </g>
          {isMortgaged && <g transform={`translate(${colorBarHeight/2}, ${pos.h/2}) rotate(-90)`}><text textAnchor="middle" fontSize={fontSize * 0.7} fill="#ef4444" fontWeight="bold">MORTGAGED</text></g>}
        </g>
      );
    }
  };

  // Utility renderers - positioned like property tiles
  const renderUtility = (space, pos, side, propertyState) => {
    const isElectric = space.id === 12;
    const emoji = isElectric ? '💡' : '💧';
    const name = isElectric ? 'ELECTRIC' : 'WATER';
    const isMortgaged = propertyState?.mortgaged;

    if (side === 'bottom') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <text x={pos.w/2} y={colorBarHeight + textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name}</text>
          <text x={pos.w/2} y={colorBarHeight + textGap + fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">CO.</text>
          <text x={pos.w/2} y={pos.h * 0.62} textAnchor="middle" fontSize={pos.h * 0.18}>{isMortgaged ? '🚫' : emoji}</text>
          <text x={pos.w/2} y={pos.h - priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          {isMortgaged && <text x={pos.w/2} y={pos.h * 0.4} textAnchor="middle" fontSize={fontSize * 0.8} fill="#ef4444" fontWeight="bold">MORTGAGED</text>}
        </g>
      );
    } else if (side === 'top') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <text x={pos.w/2} y={priceGap} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          <text x={pos.w/2} y={pos.h * 0.5} textAnchor="middle" fontSize={pos.h * 0.18}>{isMortgaged ? '🚫' : emoji}</text>
          <text x={pos.w/2} y={pos.h - colorBarHeight - textGap - fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name}</text>
          <text x={pos.w/2} y={pos.h - colorBarHeight - textGap} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">CO.</text>
          {isMortgaged && <text x={pos.w/2} y={pos.h * 0.65} textAnchor="middle" fontSize={fontSize * 0.8} fill="#ef4444" fontWeight="bold">MORTGAGED</text>}
        </g>
      );
    } else if (side === 'left') {
      // Left side: text aligned with property tiles, icon positioned to avoid overlap
      const textCenterX = pos.w - colorBarHeight - textGap;
      const iconCenterX = pos.w * 0.4;
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name}</text>
            <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">CO.</text>
          </g>
          <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.18}>{isMortgaged ? '🚫' : emoji}</text>
          </g>
          <g transform={`translate(${priceGap + priceFontSize * 0.3}, ${pos.h/2}) rotate(90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          </g>
          {isMortgaged && <g transform={`translate(${pos.w - colorBarHeight/2}, ${pos.h/2}) rotate(90)`}><text textAnchor="middle" fontSize={fontSize * 0.7} fill="#ef4444" fontWeight="bold">MORTGAGED</text></g>}
        </g>
      );
    } else {
      // Right side: text aligned with property tiles, icon positioned to avoid overlap
      const textCenterX = colorBarHeight + textGap;
      const iconCenterX = pos.w * 0.6;
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx={3}/>
          <g transform={`translate(${textCenterX}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">{name}</text>
            <text x={0} y={fontSize * 1.2} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="bold">CO.</text>
          </g>
          <g transform={`translate(${iconCenterX}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={pos.w * 0.18}>{isMortgaged ? '🚫' : emoji}</text>
          </g>
          <g transform={`translate(${pos.w - priceGap - priceFontSize * 0.3}, ${pos.h/2}) rotate(-90)`}>
            <text x={0} y={0} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          </g>
          {isMortgaged && <g transform={`translate(${colorBarHeight/2}, ${pos.h/2}) rotate(-90)`}><text textAnchor="middle" fontSize={fontSize * 0.7} fill="#ef4444" fontWeight="bold">MORTGAGED</text></g>}
        </g>
      );
    }
  };

  // Buildings - show individual houses (1-4) or hotel, rotated for side tiles
  const renderBuildings = (propertyState, pos, side) => {
    if (!propertyState) return null;
    const hasHotel = propertyState.hotels > 0;
    const houses = propertyState.houses;
    if (!hasHotel && houses === 0) return null;

    const houseSize = colorBarHeight * 0.5;
    const spacing = houseSize * 1.1;

    // Position and rotation based on side
    let x, y, rotation = 0;
    switch(side) {
      case 'bottom': x = pos.w/2; y = colorBarHeight/2; rotation = 0; break;
      case 'top': x = pos.w/2; y = pos.h - colorBarHeight/2; rotation = 0; break;
      case 'left': x = pos.w - colorBarHeight/2; y = pos.h/2; rotation = 90; break;
      case 'right': x = colorBarHeight/2; y = pos.h/2; rotation = -90; break;
      default: return null;
    }

    if (hasHotel) {
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
          <rect x={-houseSize * 1.2} y={-houseSize/2} width={houseSize * 2.4} height={houseSize} fill="#ef4444" stroke="#b91c1c" strokeWidth="1" rx={2}/>
          <text x={0} y={houseSize * 0.3} textAnchor="middle" fontSize={houseSize * 0.7} fill="white" fontWeight="bold">H</text>
        </g>
      );
    }

    // Render individual houses (1-4)
    const totalWidth = houses * spacing;
    const startX = -totalWidth / 2 + spacing / 2;

    return (
      <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        {Array.from({ length: houses }, (_, i) => (
          <g key={i} transform={`translate(${startX + i * spacing}, 0)`}>
            <rect x={-houseSize/2} y={-houseSize/2} width={houseSize} height={houseSize} fill="#22c55e" stroke="#15803d" strokeWidth="1" rx={1}/>
          </g>
        ))}
      </g>
    );
  };

  // Simple player tokens
  const renderPlayers = (position, pos) => {
    const players = getPlayersOnSpace(position);
    if (players.length === 0) return null;
    const tokenSize = Math.min(pos.w, pos.h) * 0.18;
    const centerX = pos.w / 2;
    const centerY = pos.h / 2;

    const getTokenPosition = (index, total) => {
      if (total === 1) return { x: centerX, y: centerY };
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radius = tokenSize * 0.9;
      return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    };

    return players.map((player, idx) => {
      const tokenPos = getTokenPosition(idx, players.length);
      const playerIndex = gameState.players.findIndex(p => p.id === player.id);

      return (
        <g key={player.id} transform={`translate(${tokenPos.x}, ${tokenPos.y})`}>
          <circle cx={1} cy={2} r={tokenSize/2} fill="rgba(0,0,0,0.3)"/>
          <circle cx={0} cy={0} r={tokenSize/2} fill={player.color} stroke="#222" strokeWidth="1.5"/>
          <circle cx={-tokenSize/5} cy={-tokenSize/5} r={tokenSize/4} fill="rgba(255,255,255,0.15)"/>
          <text x={0} y={3} textAnchor="middle" fontSize={tokenSize*0.55} fill="#fff" fontWeight="bold">{playerIndex + 1}</text>
          {player.inJail && position === 10 && (
            <text x={0} y={-tokenSize/2 - 3} textAnchor="middle" fontSize={fontSize * 0.7} fill="#ef4444" fontWeight="bold">JAIL</text>
          )}
        </g>
      );
    });
  };

  // Render space
  const renderSpace = (space, pos) => {
    const propertyState = getPropertyState(space);
    const side = pos.side;

    if (side === 'corner') {
      switch(space.position) {
        case 0: return renderGoCorner(pos.w);
        case 10: return renderJailCorner(pos.w);
        case 20: return renderFreeParkingCorner(pos.w, gameState.freeParkingPot || 0);
        case 30: return renderGoToJailCorner(pos.w);
        default: return null;
      }
    }

    if (space.type === 'chance' || space.type === 'community_chest' || space.type === 'tax') {
      switch(side) {
        case 'bottom': return renderSpecialBottom(space, pos);
        case 'top': return renderSpecialTop(space, pos);
        case 'left': return renderSpecialLeft(space, pos);
        case 'right': return renderSpecialRight(space, pos);
        default: return null;
      }
    }

    if (space.type === 'railroad') return renderRailroad(space, pos, side, propertyState);
    if (space.type === 'utility') return renderUtility(space, pos, side, propertyState);

    switch(side) {
      case 'bottom': return renderBottomTile(space, pos, propertyState);
      case 'top': return renderTopTile(space, pos, propertyState);
      case 'left': return renderLeftTile(space, pos, propertyState);
      case 'right': return renderRightTile(space, pos, propertyState);
      default: return null;
    }
  };

  // Larger property hover card with full rent info and actions - no gap
  const renderHoverCard = () => {
    if (!hoveredSpace) return null;
    const space = getSpaceById(hoveredSpace);
    if (!space || !space.price) return null;

    const propertyState = getPropertyState(space);
    const pos = getSpacePosition(space.position);
    const owner = propertyState?.ownerId ? gameState.players.find(p => p.id === propertyState.ownerId) : null;
    const myPlayer = gameState.players.find(p => p.id === myPlayerId);
    const isMyProperty = owner && myPlayer && owner.id === myPlayer.id;

    // Larger card dimensions
    const cardWidth = 220;
    const cardHeight = space.type === 'property' ? (isMyProperty ? 380 : 310) : (isMyProperty ? 240 : 180);

    // Position card TOUCHING the tile (no gap) - aligned with the side facing inside
    let cardX, cardY;
    if (pos.side === 'bottom') {
      cardX = pos.x + pos.w/2 - cardWidth/2;
      cardY = pos.y - cardHeight;
    } else if (pos.side === 'top') {
      cardX = pos.x + pos.w/2 - cardWidth/2;
      cardY = pos.y + pos.h;
    } else if (pos.side === 'left') {
      cardX = pos.x + pos.w;
      cardY = pos.y + pos.h/2 - cardHeight/2;
    } else if (pos.side === 'right') {
      cardX = pos.x - cardWidth;
      cardY = pos.y + pos.h/2 - cardHeight/2;
    } else {
      cardX = pos.x + pos.w;
      cardY = pos.y;
    }

    // Keep card within bounds
    if (cardX + cardWidth > boardSize - 5) cardX = boardSize - cardWidth - 5;
    if (cardY + cardHeight > boardSize - 5) cardY = boardSize - cardHeight - 5;
    if (cardX < 5) cardX = 5;
    if (cardY < 5) cardY = 5;

    const propertyColor = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color] || '#666';

    return (
      <g
        transform={`translate(${cardX}, ${cardY})`}
        onMouseEnter={() => setHoveredSpace(hoveredSpace)}
        onMouseLeave={() => setHoveredSpace(null)}
      >
        {/* Card background */}
        <rect width={cardWidth} height={cardHeight} fill="rgba(15,20,25,0.98)" stroke={TILE_COLORS.border} strokeWidth="2" rx={8}/>

        {/* Color bar for properties */}
        {space.color && <rect x={0} y={0} width={cardWidth} height={28} fill={propertyColor} rx={8} style={{clipPath: 'inset(0 0 20px 0 round 8px)'}}/>}

        {/* Title - larger */}
        <text x={cardWidth/2} y={space.color ? 50 : 26} textAnchor="middle" fontSize={16} fill={TILE_COLORS.text} fontWeight="bold">{space.name}</text>

        {/* Owner info - larger */}
        {owner ? (
          <text x={cardWidth/2} y={space.color ? 70 : 46} textAnchor="middle" fontSize={12} fill={owner.color} fontWeight="bold">Owner: {owner.name}</text>
        ) : (
          <text x={cardWidth/2} y={space.color ? 70 : 46} textAnchor="middle" fontSize={12} fill={TILE_COLORS.textMuted}>Unowned - ${space.price}</text>
        )}

        {/* Rent info for properties - rent array is [base, 1H, 2H, 3H, 4H, Hotel] */}
        {space.type === 'property' && space.rent && (
          <>
            <line x1={12} y1={space.color ? 82 : 58} x2={cardWidth-12} y2={space.color ? 82 : 58} stroke={TILE_COLORS.border} strokeWidth="1"/>
            <text x={12} y={(space.color ? 82 : 58) + 18} fontSize={11} fill={TILE_COLORS.textMuted} fontWeight="bold">RENT</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 18} textAnchor="end" fontSize={11} fill={propertyState?.houses === 0 && !propertyState?.hotels ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[0]}</text>

            <text x={12} y={(space.color ? 82 : 58) + 34} fontSize={11} fill={TILE_COLORS.textMuted}>With Color Set</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 34} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">${space.rent[0] * 2}</text>

            <text x={12} y={(space.color ? 82 : 58) + 50} fontSize={11} fill={TILE_COLORS.textMuted}>With 1 House</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 50} textAnchor="end" fontSize={11} fill={propertyState?.houses === 1 ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[1]}</text>

            <text x={12} y={(space.color ? 82 : 58) + 66} fontSize={11} fill={TILE_COLORS.textMuted}>With 2 Houses</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 66} textAnchor="end" fontSize={11} fill={propertyState?.houses === 2 ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[2]}</text>

            <text x={12} y={(space.color ? 82 : 58) + 82} fontSize={11} fill={TILE_COLORS.textMuted}>With 3 Houses</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 82} textAnchor="end" fontSize={11} fill={propertyState?.houses === 3 ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[3]}</text>

            <text x={12} y={(space.color ? 82 : 58) + 98} fontSize={11} fill={TILE_COLORS.textMuted}>With 4 Houses</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 98} textAnchor="end" fontSize={11} fill={propertyState?.houses === 4 && !propertyState?.hotels ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[4]}</text>

            <text x={12} y={(space.color ? 82 : 58) + 114} fontSize={11} fill={TILE_COLORS.textMuted}>With HOTEL</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 114} textAnchor="end" fontSize={11} fill={propertyState?.hotels > 0 ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">${space.rent[5]}</text>

            <line x1={12} y1={(space.color ? 82 : 58) + 126} x2={cardWidth-12} y2={(space.color ? 82 : 58) + 126} stroke={TILE_COLORS.border} strokeWidth="1"/>

            <text x={12} y={(space.color ? 82 : 58) + 144} fontSize={11} fill={TILE_COLORS.textMuted}>House Cost</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 144} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">${space.houseCost}</text>

            <text x={12} y={(space.color ? 82 : 58) + 160} fontSize={11} fill={TILE_COLORS.textMuted}>Mortgage Value</text>
            <text x={cardWidth-12} y={(space.color ? 82 : 58) + 160} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">${space.mortgageValue}</text>
          </>
        )}

        {/* Rent info for railroads */}
        {space.type === 'railroad' && (
          <>
            <line x1={12} y1={58} x2={cardWidth-12} y2={58} stroke={TILE_COLORS.border} strokeWidth="1"/>
            <text x={12} y={76} fontSize={11} fill={TILE_COLORS.textMuted}>1 Railroad</text>
            <text x={cardWidth-12} y={76} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">$25</text>
            <text x={12} y={92} fontSize={11} fill={TILE_COLORS.textMuted}>2 Railroads</text>
            <text x={cardWidth-12} y={92} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">$50</text>
            <text x={12} y={108} fontSize={11} fill={TILE_COLORS.textMuted}>3 Railroads</text>
            <text x={cardWidth-12} y={108} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">$100</text>
            <text x={12} y={124} fontSize={11} fill={TILE_COLORS.textMuted}>4 Railroads</text>
            <text x={cardWidth-12} y={124} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">$200</text>
          </>
        )}

        {/* Rent info for utilities */}
        {space.type === 'utility' && (
          <>
            <line x1={12} y1={58} x2={cardWidth-12} y2={58} stroke={TILE_COLORS.border} strokeWidth="1"/>
            <text x={12} y={76} fontSize={11} fill={TILE_COLORS.textMuted}>1 Utility</text>
            <text x={cardWidth-12} y={76} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">4x Dice</text>
            <text x={12} y={92} fontSize={11} fill={TILE_COLORS.textMuted}>2 Utilities</text>
            <text x={cardWidth-12} y={92} textAnchor="end" fontSize={11} fill={TILE_COLORS.text} fontWeight="bold">10x Dice</text>
          </>
        )}

        {/* Status badges */}
        {propertyState?.mortgaged && (
          <g transform={`translate(${cardWidth/2}, ${cardHeight - (isMyProperty ? 80 : 25)})`}>
            <rect x={-50} y={-12} width={100} height={24} fill="#dc2626" rx={4}/>
            <text textAnchor="middle" y={5} fontSize={12} fill="white" fontWeight="bold">MORTGAGED</text>
          </g>
        )}

        {propertyState?.houses > 0 && !propertyState.hotels && !propertyState.mortgaged && (
          <g transform={`translate(${cardWidth/2}, ${cardHeight - (isMyProperty ? 80 : 25)})`}>
            <rect x={-40} y={-12} width={80} height={24} fill="#22c55e" rx={4}/>
            <text textAnchor="middle" y={5} fontSize={12} fill="white" fontWeight="bold">{propertyState.houses} House{propertyState.houses > 1 ? 's' : ''}</text>
          </g>
        )}

        {propertyState?.hotels > 0 && !propertyState.mortgaged && (
          <g transform={`translate(${cardWidth/2}, ${cardHeight - (isMyProperty ? 80 : 25)})`}>
            <rect x={-35} y={-12} width={70} height={24} fill="#ef4444" rx={4}/>
            <text textAnchor="middle" y={5} fontSize={12} fill="white" fontWeight="bold">HOTEL</text>
          </g>
        )}

        {/* Action buttons for owned properties - larger */}
        {isMyProperty && isMyTurn && socket && (
          <g transform={`translate(0, ${cardHeight - 65})`}>
            <line x1={12} y1={0} x2={cardWidth-12} y2={0} stroke={TILE_COLORS.border} strokeWidth="1"/>

            {/* Build house button (when houses < 4) */}
            {space.type === 'property' && !propertyState.mortgaged && propertyState.houses < 4 && !propertyState.hotels && (
              <g
                transform="translate(12, 12)"
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('buildHouse', space.id)}
              >
                <rect width={90} height={42} fill="#22c55e" rx={4}/>
                <text x={45} y={18} textAnchor="middle" fontSize={18} fill="white" fontWeight="bold">▲</text>
                <text x={45} y={34} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">Build House</text>
              </g>
            )}

            {/* Build hotel button (when houses === 4) */}
            {space.type === 'property' && !propertyState.mortgaged && propertyState.houses === 4 && !propertyState.hotels && (
              <g
                transform="translate(12, 12)"
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('buildHotel', space.id)}
              >
                <rect width={90} height={42} fill="#dc2626" rx={4}/>
                <text x={45} y={18} textAnchor="middle" fontSize={18} fill="white" fontWeight="bold">🏨</text>
                <text x={45} y={34} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">Build Hotel</text>
              </g>
            )}

            {/* Sell house button */}
            {space.type === 'property' && propertyState.houses > 0 && !propertyState.hotels && (
              <g
                transform="translate(118, 12)"
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('sellHouse', space.id)}
              >
                <rect width={90} height={42} fill="#f59e0b" rx={4}/>
                <text x={45} y={18} textAnchor="middle" fontSize={18} fill="white" fontWeight="bold">▼</text>
                <text x={45} y={34} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">Sell House</text>
              </g>
            )}

            {/* Sell hotel button */}
            {space.type === 'property' && propertyState.hotels > 0 && (
              <g
                transform="translate(118, 12)"
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('sellHotel', space.id)}
              >
                <rect width={90} height={42} fill="#f59e0b" rx={4}/>
                <text x={45} y={18} textAnchor="middle" fontSize={18} fill="white" fontWeight="bold">▼</text>
                <text x={45} y={34} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">Sell Hotel</text>
              </g>
            )}

            {/* Mortgage button */}
            {!propertyState.mortgaged && propertyState.houses === 0 && !propertyState.hotels && (
              <g
                transform={`translate(${space.type === 'property' ? 118 : 12}, 12)`}
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('mortgage', space.id)}
              >
                <rect width={90} height={42} fill="#ef4444" rx={4}/>
                <text x={45} y={28} textAnchor="middle" fontSize={11} fill="white" fontWeight="bold">Mortgage</text>
              </g>
            )}

            {/* Unmortgage button */}
            {propertyState.mortgaged && (
              <g
                transform="translate(12, 12)"
                style={{cursor: actionLoading ? 'wait' : 'pointer'}}
                onClick={() => !actionLoading && handlePropertyAction('unmortgage', space.id)}
              >
                <rect width={196} height={42} fill="#3b82f6" rx={4}/>
                <text x={98} y={28} textAnchor="middle" fontSize={11} fill="white" fontWeight="bold">Unmortgage (${Math.floor(space.mortgageValue * 1.1)})</text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const renderDebugMenu = () => {
    if (!showDebugMenu) return null;
    const myPlayer = gameState.players.find(p => p.id === myPlayerId);
    const unownedProperties = BOARD_SPACES.filter(s =>
      (s.type === 'property' || s.type === 'railroad' || s.type === 'utility') &&
      !gameState.properties[s.id]?.ownerId
    );

    return (
      <div className="debug-menu">
        <div className="debug-menu-header">
          <h3>Debug Menu</h3>
          <button onClick={() => setShowDebugMenu(false)}>x</button>
        </div>
        <div className="debug-menu-content">
          <div className="debug-section">
            <h4>Add Cash</h4>
            <div className="debug-buttons">
              <button onClick={() => handleDebugAddCash(100)}>+$100</button>
              <button onClick={() => handleDebugAddCash(500)}>+$500</button>
              <button onClick={() => handleDebugAddCash(1000)}>+$1000</button>
              <button onClick={() => handleDebugAddCash(5000)}>+$5000</button>
            </div>
          </div>
          <div className="debug-section">
            <h4>Quick Add Properties</h4>
            <div className="debug-property-list">
              {unownedProperties.slice(0, 10).map(prop => (
                <button key={prop.id} onClick={() => handleDebugAddProperty(prop.id)} className="debug-property-btn">
                  {prop.name.substring(0, 18)}
                </button>
              ))}
            </div>
          </div>
          <div className="debug-section">
            <h4>Current State</h4>
            <div className="debug-info">
              <p>Phase: {gameState.phase}</p>
              <p>Current Player: {currentPlayer?.name}</p>
              <p>My Cash: ${myPlayer?.cash || 0}</p>
              <p>Has Rolled: {gameState.hasRolledThisTurn ? 'Yes' : 'No'}</p>
              <p>Can Roll Again: {gameState.canRollAgain ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check if mouse is over board to handle leaving the board entirely
  const handleBoardMouseLeave = () => {
    setHoveredSpace(null);
  };

  return (
    <div className="board-2d" ref={containerRef} style={{ position: 'relative' }} onMouseLeave={handleBoardMouseLeave}>
      <svg width={boardSize} height={boardSize} viewBox={`0 0 ${boardSize} ${boardSize}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}>
        <defs>
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill={WOOD_COLORS.medium}/>
            <path d="M0,10 Q25,5 50,10 T100,10" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,30 Q25,25 50,30 T100,30" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,50 Q25,45 50,50 T100,50" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,70 Q25,65 50,70 T100,70" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,90 Q25,85 50,90 T100,90" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
          </pattern>
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a2e" />
            <stop offset="50%" stopColor="#0f3020" />
            <stop offset="100%" stopColor="#1a4a2e" />
          </linearGradient>
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          <filter id="dropShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4"/>
          </filter>
        </defs>

        <rect x="0" y="0" width={boardSize} height={boardSize} fill="url(#woodGrain)" rx={8}/>
        <rect x="0" y="0" width={boardSize} height={boardSize} fill="none" stroke={WOOD_COLORS.dark} strokeWidth="4" rx={8}/>
        <rect x={innerBoardStart} y={innerBoardStart} width={innerBoardSize} height={innerBoardSize} fill="url(#woodGrain)" stroke={WOOD_COLORS.dark} strokeWidth="3"/>
        <rect x={innerBoardStart + woodBorderWidth} y={innerBoardStart + woodBorderWidth} width={innerBoardSize - 2 * woodBorderWidth} height={innerBoardSize - 2 * woodBorderWidth} fill="url(#boardBg)"/>

        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          <text textAnchor="middle" y={-boardSize * 0.13} fontSize={boardSize * 0.06} fontWeight="bold" fill="#f59e0b" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="6">MONOPOLY</text>
          <g transform="translate(0, 10)">
            <g transform="translate(-40, -30)"><DiceFace value={displayDice[0]} size={60} isRolling={isRolling} /></g>
            <g transform="translate(40, -30)"><DiceFace value={displayDice[1]} size={60} isRolling={isRolling} /></g>
            {gameState.settings?.speedDie && gameState.speedDie && (
              <g transform="translate(0, 50)"><SpeedDieFace value={gameState.speedDie} size={45} /></g>
            )}
            {canRoll && isMyTurn && (
              <g transform="translate(0, 70)" onClick={handleRollDice} style={{ cursor: 'pointer' }} className="roll-button">
                <rect x="-60" y="-18" width="120" height="36" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx={18} filter="url(#dropShadow)"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#1a1a1a" fontWeight="bold">{isRolling ? 'Rolling...' : 'Roll Dice'}</text>
              </g>
            )}
          </g>
          <g transform="translate(0, 130)">
            <rect x="-110" y="-18" width="220" height="36" fill="rgba(0, 0, 0, 0.4)" rx={18} stroke={TILE_COLORS.border} strokeWidth="1"/>
            <circle cx="-80" cy="0" r="10" fill={currentPlayer?.color || '#666'}/>
            <text x="5" textAnchor="middle" dominantBaseline="middle" fontSize="15" fill={TILE_COLORS.text} fontWeight="bold">{currentPlayer?.name}'s Turn</text>
          </g>
        </g>

        {/* Render all tiles first */}
        {BOARD_SPACES.map((space) => {
          const pos = getSpacePosition(space.position);
          return (
            <g
              key={space.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => handleMouseEnter(space.id)}
              style={{ cursor: 'pointer' }}
            >
              {renderSpace(space, pos)}
              {renderPlayers(space.position, pos)}
            </g>
          );
        })}

        {/* Render owner borders AFTER all tiles so they appear on top */}
        {/* Inset by 2px so adjacent borders don't overlap */}
        {BOARD_SPACES.map((space) => {
          const propertyState = getPropertyState(space);
          if (!propertyState?.ownerId) return null;
          const ownerColor = getOwnerColor(propertyState.ownerId);
          const pos = getSpacePosition(space.position);
          const inset = 2;
          return (
            <g key={`owner-${space.id}`} transform={`translate(${pos.x}, ${pos.y})`} style={{ pointerEvents: 'none' }}>
              <rect x={inset} y={inset} width={pos.w - inset * 2} height={pos.h - inset * 2} fill="none" stroke={ownerColor} strokeWidth="3" rx={2}/>
            </g>
          );
        })}

        {renderHoverCard()}
      </svg>

      <button className="debug-button" onClick={() => setShowDebugMenu(!showDebugMenu)}>Debug</button>
      {renderDebugMenu()}
    </div>
  );
}
