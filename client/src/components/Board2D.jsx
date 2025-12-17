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
  price: '#4ade80',
  border: '#c9a227', // Gold border
  borderDark: '#8b7355',
};

// Wood colors for borders
const WOOD_COLORS = {
  light: '#8B5A2B',
  medium: '#6B4423',
  dark: '#4a2c17',
  grain1: '#7a4a1f',
  grain2: '#5c3a1a',
};

// Dice pip positions (normalized 0-1)
const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.5], [0.72, 0.5], [0.28, 0.72], [0.72, 0.72]],
};

// Dice face component with pips
const DiceFace = ({ value, size, isRolling }) => {
  const pips = PIP_POSITIONS[value] || [];
  const pipRadius = size * 0.09;

  return (
    <g className={isRolling ? 'dice-rolling' : ''}>
      {/* Dice shadow */}
      <rect
        x={-size/2 + 3}
        y={-size/2 + 3}
        width={size}
        height={size}
        fill="rgba(0,0,0,0.3)"
        rx={size * 0.18}
      />
      {/* Dice body */}
      <rect
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="url(#diceGradient)"
        stroke="#ccc"
        strokeWidth="2"
        rx={size * 0.18}
      />
      {/* Pips */}
      {pips.map(([px, py], idx) => (
        <circle
          key={idx}
          cx={-size/2 + px * size}
          cy={-size/2 + py * size}
          r={pipRadius}
          fill="#1a1a1a"
        />
      ))}
    </g>
  );
};

// Speed die face (1,2,3, Bus, Mr. Monopoly)
const SpeedDieFace = ({ value, size }) => {
  return (
    <g>
      <rect
        x={-size/2 + 2}
        y={-size/2 + 2}
        width={size}
        height={size}
        fill="rgba(0,0,0,0.3)"
        rx={size * 0.18}
      />
      <rect
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="#2ecc71"
        stroke="#27ae60"
        strokeWidth="2"
        rx={size * 0.18}
      />
      {typeof value === 'number' ? (
        PIP_POSITIONS[value]?.map(([px, py], idx) => (
          <circle
            key={idx}
            cx={-size/2 + px * size}
            cy={-size/2 + py * size}
            r={size * 0.09}
            fill="#fff"
          />
        ))
      ) : value === 'Bus' ? (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.35} fill="#fff" fontWeight="bold">BUS</text>
      ) : (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.3} fill="#fff" fontWeight="bold">MR.M</text>
      )}
    </g>
  );
};

// House icon component
const HouseIcon = ({ x, y, size = 12 }) => (
  <g transform={`translate(${x - size/2}, ${y - size/2})`}>
    <path
      d={`M${size/2},0 L${size},${size*0.45} L${size},${size} L0,${size} L0,${size*0.45} Z`}
      fill="#22c55e"
      stroke="#15803d"
      strokeWidth="1.5"
    />
  </g>
);

// Hotel icon component
const HotelIcon = ({ x, y, size = 16 }) => (
  <g transform={`translate(${x - size/2}, ${y - size*0.4})`}>
    <rect width={size} height={size * 0.8} rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5"/>
    <text x={size/2} y={size * 0.55} textAnchor="middle" fontSize={size * 0.45} fill="white" fontWeight="bold">H</text>
  </g>
);

// Corner space renderers
const renderGoCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      {/* GO text at top */}
      <text y={-size*0.28} textAnchor="middle" fontSize={size*0.18} fill="#e74c3c" fontWeight="bold">GO</text>
      {/* Red arrow */}
      <g transform="translate(0, 5)">
        <polygon
          points={`${-size*0.25},-${size*0.08} ${size*0.12},-${size*0.08} ${size*0.12},-${size*0.15} ${size*0.28},0 ${size*0.12},${size*0.15} ${size*0.12},${size*0.08} ${-size*0.25},${size*0.08}`}
          fill="#e74c3c"
          stroke="#c0392b"
          strokeWidth="1.5"
        />
      </g>
      {/* Collect text */}
      <text y={size*0.32} textAnchor="middle" fontSize={size*0.09} fill={TILE_COLORS.price} fontWeight="bold">COLLECT $200</text>
    </g>
  </g>
);

const renderJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>

    {/* Just Visiting section - bottom left triangle with clear border */}
    <g>
      <path
        d={`M0,${size} L0,${size*0.4} L${size*0.4},${size} Z`}
        fill={TILE_COLORS.background}
        stroke={TILE_COLORS.border}
        strokeWidth="2"
      />
      <text
        x={size*0.12}
        y={size*0.82}
        fontSize={size*0.065}
        fill={TILE_COLORS.text}
        fontWeight="bold"
        transform={`rotate(-45, ${size*0.12}, ${size*0.82})`}
      >
        JUST
      </text>
      <text
        x={size*0.18}
        y={size*0.92}
        fontSize={size*0.065}
        fill={TILE_COLORS.text}
        fontWeight="bold"
        transform={`rotate(-45, ${size*0.18}, ${size*0.92})`}
      >
        VISITING
      </text>
    </g>

    {/* Jail cell - top right area */}
    <g transform={`translate(${size*0.35}, ${size*0.08})`}>
      <rect
        width={size*0.57}
        height={size*0.52}
        fill="#2d2d2d"
        stroke="#444"
        strokeWidth="3"
        rx="2"
      />
      {/* Bars */}
      {[0.15, 0.35, 0.55, 0.75, 0.95].map((xPos, i) => (
        <line
          key={i}
          x1={size*0.57*xPos}
          y1={0}
          x2={size*0.57*xPos}
          y2={size*0.52}
          stroke="#888"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <text
        x={size*0.285}
        y={size*0.3}
        textAnchor="middle"
        fontSize={size*0.085}
        fill="#f59e0b"
        fontWeight="bold"
      >
        IN JAIL
      </text>
    </g>
  </g>
);

const renderFreeParkingCorner = (size, potAmount = 0) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      {/* Title */}
      <text y={-size*0.32} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">FREE</text>
      <text y={-size*0.2} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">PARKING</text>

      {/* Car icon */}
      <g transform="scale(1.8) translate(-12, -2)">
        <path d="M2,8 L2,6 Q2,4 4,4 L8,4 L10,2 L16,2 L18,4 L22,4 Q24,4 24,6 L24,8 L22,8 L22,10 L4,10 L4,8 Z" fill="#e74c3c" stroke="#c0392b" strokeWidth="0.5"/>
        <circle cx="7" cy="10" r="2.5" fill="#333"/>
        <circle cx="19" cy="10" r="2.5" fill="#333"/>
      </g>

      {/* Pot amount */}
      {potAmount > 0 && (
        <text y={size*0.38} textAnchor="middle" fontSize={size*0.11} fill={TILE_COLORS.price} fontWeight="bold">${potAmount}</text>
      )}
    </g>
  </g>
);

const renderGoToJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      {/* Title */}
      <text y={-size*0.32} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">GO TO</text>
      <text y={-size*0.2} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">JAIL</text>

      {/* Police officer */}
      <g transform="translate(0, 8)">
        <circle cx="0" cy="-8" r={size*0.1} fill="#3498db"/>
        <rect x={-size*0.08} y={-2} width={size*0.16} height={size*0.18} fill="#3498db" rx="2"/>
        <circle cx="0" cy="-8" r={size*0.065} fill="#fad7a0"/>
        <line x1={size*0.08} y1="4" x2={size*0.22} y2="-8" stroke="#fad7a0" strokeWidth="4" strokeLinecap="round"/>
      </g>
    </g>
  </g>
);

// Special space icons with names
const renderChanceSpace = (w, h) => (
  <g>
    <rect x={-2} y={-2} width={w+4} height={h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${w/2}, ${h/2 - 5})`}>
      <rect x="-14" y="-18" width="28" height="24" fill="#f39c12" stroke="#e67e22" strokeWidth="1.5" rx="3"/>
      <text textAnchor="middle" dominantBaseline="middle" y="-5" fontSize="22" fill="#fff" fontWeight="bold">?</text>
    </g>
    <text x={w/2} y={h - 10} textAnchor="middle" fontSize="9" fill={TILE_COLORS.text} fontWeight="bold">CHANCE</text>
  </g>
);

const renderCommunityChestSpace = (w, h) => (
  <g>
    <rect x={-2} y={-2} width={w+4} height={h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${w/2}, ${h/2 - 8})`}>
      <rect x="-12" y="-6" width="24" height="14" fill="#3498db" stroke="#2980b9" strokeWidth="1.5" rx="2"/>
      <path d="M-12,-6 Q0,-16 12,-6" fill="#3498db" stroke="#2980b9" strokeWidth="1.5"/>
      <rect x="-3" y="-3" width="6" height="6" fill="#f1c40f" rx="1"/>
    </g>
    <text x={w/2} y={h - 10} textAnchor="middle" fontSize="8" fill={TILE_COLORS.text} fontWeight="bold">COMMUNITY</text>
    <text x={w/2} y={h - 1} textAnchor="middle" fontSize="8" fill={TILE_COLORS.text} fontWeight="bold">CHEST</text>
  </g>
);

const renderTaxSpace = (w, h, amount, name) => (
  <g>
    <rect x={-2} y={-2} width={w+4} height={h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${w/2}, ${h/2 - 10})`}>
      <polygon points="0,-14 12,10 -12,10" fill="#9b59b6" stroke="#8e44ad" strokeWidth="1.5"/>
      <text y="3" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">$</text>
    </g>
    <text x={w/2} y={h - 18} textAnchor="middle" fontSize="8" fill={TILE_COLORS.text} fontWeight="bold">{name.toUpperCase()}</text>
    <text x={w/2} y={h - 8} textAnchor="middle" fontSize="10" fill={TILE_COLORS.price} fontWeight="bold">${amount}</text>
  </g>
);

const renderRailroadSpace = (w, h, name) => (
  <g>
    <rect x={-2} y={-2} width={w+4} height={h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${w/2}, ${h/2 - 12})`}>
      {/* Steam train silhouette */}
      <rect x="-14" y="0" width="28" height="12" fill="#4a4a4a" rx="2"/>
      <rect x="-18" y="2" width="8" height="10" fill="#4a4a4a"/>
      <circle cx="-14" cy="14" r="4" fill="#333"/>
      <circle cx="0" cy="14" r="4" fill="#333"/>
      <circle cx="12" cy="14" r="4" fill="#333"/>
      <rect x="-10" y="-6" width="10" height="6" fill="#e74c3c"/>
    </g>
    <text x={w/2} y={h - 18} textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">{name.split(' ')[0].toUpperCase()}</text>
    <text x={w/2} y={h - 9} textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">RAILROAD</text>
  </g>
);

const renderUtilitySpace = (w, h, isElectric, name) => (
  <g>
    <rect x={-2} y={-2} width={w+4} height={h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${w/2}, ${h/2 - 10})`}>
      {isElectric ? (
        <polygon points="0,-18 10,2 3,2 8,18 -8,2 0,2" fill="#f1c40f" stroke="#f39c12" strokeWidth="1.5"/>
      ) : (
        <path d="M0,-16 Q14,6 0,16 Q-14,6 0,-16" fill="#3498db" stroke="#2980b9" strokeWidth="1.5"/>
      )}
    </g>
    <text x={w/2} y={h - 18} textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">{isElectric ? 'ELECTRIC' : 'WATER'}</text>
    <text x={w/2} y={h - 9} textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">{isElectric ? 'COMPANY' : 'WORKS'}</text>
  </g>
);

export default function Board2D({
  gameState,
  onPropertyClick,
  onRollDice,
  isMyTurn = false,
  canRoll = false,
  myPlayerId = null,
  socket = null,
  gameId = null
}) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(880);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(gameState?.dice || [1, 1]);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

  // Responsive sizing - bigger default
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.game-center');
      if (container) {
        const maxSize = Math.min(container.clientWidth - 20, container.clientHeight - 20, 950);
        setBoardSize(Math.max(maxSize, 700));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update display dice when gameState changes
  useEffect(() => {
    if (gameState?.dice && !isRolling) {
      setDisplayDice(gameState.dice);
    }
  }, [gameState?.dice, isRolling]);

  // Scaled dimensions - bigger proportions
  const woodBorderWidth = Math.round(boardSize * 0.025);
  const cornerSize = Math.round(boardSize * 0.13);
  const colorBarHeight = Math.round(boardSize * 0.028);
  const sideSpaces = 9;
  const spaceWidth = (boardSize - 2 * cornerSize - 2 * woodBorderWidth) / sideSpaces;
  const innerBoardStart = cornerSize + woodBorderWidth;
  const innerBoardSize = boardSize - 2 * cornerSize - 2 * woodBorderWidth;

  // Calculate position for each space
  const getSpacePosition = (position) => {
    const offset = woodBorderWidth;
    if (position === 0) {
      return { x: boardSize - cornerSize - offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 0 && position < 10) {
      return {
        x: boardSize - cornerSize - offset - (position * spaceWidth),
        y: boardSize - cornerSize - offset,
        w: spaceWidth,
        h: cornerSize,
        rotation: 0,
        colorBarSide: 'top'
      };
    } else if (position === 10) {
      return { x: offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 10 && position < 20) {
      const idx = position - 10;
      return {
        x: offset,
        y: boardSize - cornerSize - offset - (idx * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        rotation: 90,
        colorBarSide: 'right'
      };
    } else if (position === 20) {
      return { x: offset, y: offset, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 20 && position < 30) {
      const idx = position - 20;
      return {
        x: cornerSize + offset + ((idx - 1) * spaceWidth),
        y: offset,
        w: spaceWidth,
        h: cornerSize,
        rotation: 180,
        colorBarSide: 'bottom'
      };
    } else if (position === 30) {
      return { x: boardSize - cornerSize - offset, y: offset, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else {
      const idx = position - 30;
      return {
        x: boardSize - cornerSize - offset,
        y: cornerSize + offset + ((idx - 1) * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        rotation: 270,
        colorBarSide: 'left'
      };
    }
  };

  const getPlayersOnSpace = (position) => {
    return gameState.players.filter(p => p.position === position && !p.isBankrupt);
  };

  const getPropertyState = (space) => {
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      return gameState.properties[space.id];
    }
    return null;
  };

  const getOwnerColor = (ownerId) => {
    const owner = gameState.players.find(p => p.id === ownerId);
    return owner?.color || '#666';
  };

  // Handle dice roll with animation
  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;

    setIsRolling(true);

    const animationDuration = 1000;
    const frameInterval = 100;
    let elapsed = 0;

    const animateInterval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      elapsed += frameInterval;

      if (elapsed >= animationDuration) {
        clearInterval(animateInterval);
      }
    }, frameInterval);

    if (onRollDice) {
      try {
        await onRollDice();
      } finally {
        setTimeout(() => {
          setIsRolling(false);
        }, animationDuration);
      }
    } else {
      setTimeout(() => {
        setIsRolling(false);
      }, animationDuration);
    }
  };

  // Debug functions
  const handleDebugAddCash = async (amount) => {
    if (socket && gameId) {
      try {
        await socket.emit('debugAddCash', { gameId, amount });
      } catch (err) {
        console.error('Debug add cash failed:', err);
      }
    }
  };

  const handleDebugAddProperty = async (propertyId) => {
    if (socket && gameId) {
      try {
        await socket.emit('debugAddProperty', { gameId, propertyId });
      } catch (err) {
        console.error('Debug add property failed:', err);
      }
    }
  };

  // Render color bar for properties
  const renderColorBar = (space, pos) => {
    if (!space.color) return null;
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];

    let barX = 0, barY = 0, barW = 0, barH = colorBarHeight;

    switch(pos.colorBarSide) {
      case 'top':
        barW = pos.w;
        break;
      case 'bottom':
        barY = pos.h - colorBarHeight;
        barW = pos.w;
        break;
      case 'left':
        barH = pos.h;
        barW = colorBarHeight;
        break;
      case 'right':
        barX = pos.w - colorBarHeight;
        barH = pos.h;
        barW = colorBarHeight;
        break;
      default:
        return null;
    }

    return (
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        fill={color}
        rx="2"
      />
    );
  };

  // Render houses/hotel on color bar
  const renderBuildings = (propertyState, pos, space) => {
    if (!propertyState || !space.color) return null;

    const hasHotel = propertyState.hotels > 0;
    const houses = propertyState.houses;

    if (!hasHotel && houses === 0) return null;

    let buildingX, buildingY;
    switch(pos.colorBarSide) {
      case 'top':
        buildingX = pos.w / 2;
        buildingY = colorBarHeight / 2 + 2;
        break;
      case 'bottom':
        buildingX = pos.w / 2;
        buildingY = pos.h - colorBarHeight / 2 - 2;
        break;
      case 'left':
        buildingX = colorBarHeight / 2 + 2;
        buildingY = pos.h / 2;
        break;
      case 'right':
        buildingX = pos.w - colorBarHeight / 2 - 2;
        buildingY = pos.h / 2;
        break;
      default:
        return null;
    }

    if (hasHotel) {
      return <HotelIcon x={buildingX} y={buildingY} size={colorBarHeight * 1.3} />;
    }

    return (
      <g>
        <HouseIcon x={buildingX - 10} y={buildingY} size={colorBarHeight * 1.1} />
        {houses > 1 && (
          <text
            x={buildingX + 8}
            y={buildingY + 4}
            fontSize={colorBarHeight * 0.8}
            fill="#fff"
            fontWeight="bold"
          >
            ×{houses}
          </text>
        )}
      </g>
    );
  };

  // Render owner border
  const renderOwnerBorder = (propertyState, pos) => {
    if (!propertyState?.ownerId) return null;
    const ownerColor = getOwnerColor(propertyState.ownerId);

    return (
      <rect
        x={3}
        y={3}
        width={pos.w - 6}
        height={pos.h - 6}
        fill="none"
        stroke={ownerColor}
        strokeWidth="4"
        rx="3"
        opacity="0.9"
      />
    );
  };

  // Render mortgaged indicator
  const renderMortgaged = (propertyState, pos) => {
    if (!propertyState?.mortgaged) return null;

    return (
      <>
        <rect x={0} y={0} width={pos.w} height={pos.h} fill="rgba(0,0,0,0.6)" rx="4"/>
        <text x={pos.w/2} y={pos.h/2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#ef4444" fontWeight="bold">
          MORTGAGED
        </text>
      </>
    );
  };

  // Render player tokens - simple circles with gradient
  const renderPlayers = (position, pos) => {
    const players = getPlayersOnSpace(position);
    if (players.length === 0) return null;

    const tokenSize = Math.min(pos.w, pos.h) * 0.22;
    const centerX = pos.w / 2;
    const centerY = pos.h / 2 + (pos.colorBarSide === 'top' ? colorBarHeight / 2 : 0);

    const getTokenPosition = (index, total) => {
      if (total === 1) return { x: centerX, y: centerY };
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radius = tokenSize * 0.8;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    };

    return players.map((player, idx) => {
      const tokenPos = getTokenPosition(idx, players.length);
      const playerIndex = gameState.players.findIndex(p => p.id === player.id);

      return (
        <g key={player.id} transform={`translate(${tokenPos.x}, ${tokenPos.y})`}>
          {/* Shadow */}
          <ellipse cx={2} cy={tokenSize/2} rx={tokenSize/2} ry={tokenSize/4} fill="rgba(0,0,0,0.4)"/>
          {/* Token circle with gradient */}
          <defs>
            <radialGradient id={`tokenGrad-${player.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={player.color} stopOpacity="1"/>
              <stop offset="70%" stopColor={player.color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
            </radialGradient>
          </defs>
          <circle
            cx={0}
            cy={0}
            r={tokenSize/2}
            fill={`url(#tokenGrad-${player.id})`}
            stroke="#222"
            strokeWidth="2"
          />
          {/* Highlight */}
          <ellipse cx={-tokenSize/6} cy={-tokenSize/6} rx={tokenSize/5} ry={tokenSize/6} fill="rgba(255,255,255,0.3)"/>

          {/* Player number */}
          <text x={0} y={4} textAnchor="middle" fontSize={tokenSize*0.6} fill="#fff" fontWeight="bold">
            {playerIndex + 1}
          </text>

          {/* In jail indicator */}
          {player.inJail && position === 10 && (
            <text x={0} y={-tokenSize/2 - 6} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="bold">
              JAILED
            </text>
          )}
        </g>
      );
    });
  };

  // Render space content (name, icons)
  const renderSpaceContent = (space, pos) => {
    const isCorner = space.position % 10 === 0;
    if (isCorner) return null;

    // Special spaces
    if (space.type === 'chance') return renderChanceSpace(pos.w, pos.h);
    if (space.type === 'community_chest') return renderCommunityChestSpace(pos.w, pos.h);
    if (space.type === 'tax') return renderTaxSpace(pos.w, pos.h, space.amount, space.name);
    if (space.type === 'railroad') return renderRailroadSpace(pos.w, pos.h, space.name);
    if (space.type === 'utility') return renderUtilitySpace(pos.w, pos.h, space.id === 12, space.name);

    // Regular property
    const lines = space.name.split(' ');
    const displayLines = lines.length > 2 ? [lines.slice(0, -1).join(' '), lines[lines.length - 1]] : lines;

    return (
      <g>
        {/* Background */}
        <rect x={-2} y={-2} width={pos.w+4} height={pos.h+4} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
        {/* Color bar */}
        {renderColorBar(space, pos)}
        {/* Name */}
        {displayLines.map((line, i) => (
          <text
            key={i}
            x={pos.w / 2}
            y={colorBarHeight + 18 + i * 12}
            textAnchor="middle"
            fontSize="9"
            fill={TILE_COLORS.text}
            fontWeight="600"
          >
            {line.length > 14 ? line.substring(0, 13) + '…' : line}
          </text>
        ))}
      </g>
    );
  };

  // Render price
  const renderPrice = (space, pos) => {
    if (!space.price) return null;

    return (
      <text
        x={pos.w / 2}
        y={pos.h - 10}
        textAnchor="middle"
        fontSize="11"
        fill={TILE_COLORS.price}
        fontWeight="bold"
      >
        ${space.price}
      </text>
    );
  };

  // Render rent tooltip on hover
  const renderTooltip = (space, pos) => {
    if (hoveredSpace !== space.id) return null;

    const propertyState = getPropertyState(space);
    if (!space.rent) return null;

    let currentRent = space.rent[0];
    if (propertyState) {
      if (propertyState.hotels > 0) {
        currentRent = space.rent[5];
      } else if (propertyState.houses > 0) {
        currentRent = space.rent[propertyState.houses];
      }
    }

    const owner = propertyState?.ownerId ? gameState.players.find(p => p.id === propertyState.ownerId) : null;

    return (
      <g transform={`translate(${pos.w/2}, ${-40})`} className="rent-tooltip">
        <rect x="-55" y="-28" width="110" height="56" fill="rgba(0,0,0,0.95)" rx="8" stroke={TILE_COLORS.border} strokeWidth="1"/>
        <text x="0" y="-12" textAnchor="middle" fontSize="10" fill="#e6edf3" fontWeight="bold">
          Rent: ${currentRent}
        </text>
        {owner && (
          <text x="0" y="6" textAnchor="middle" fontSize="9" fill={owner.color}>
            Owner: {owner.name}
          </text>
        )}
      </g>
    );
  };

  // Render corner spaces
  const renderCorner = (space, pos) => {
    switch(space.position) {
      case 0: return renderGoCorner(pos.w);
      case 10: return renderJailCorner(pos.w);
      case 20: return renderFreeParkingCorner(pos.w, gameState.freeParkingPot || 0);
      case 30: return renderGoToJailCorner(pos.w);
      default: return null;
    }
  };

  // Get current player for turn display
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Debug menu
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
          <button onClick={() => setShowDebugMenu(false)}>×</button>
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
                  {prop.name.substring(0, 15)}
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

  return (
    <div className="board-2d" ref={containerRef}>
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
        }}
      >
        {/* Definitions */}
        <defs>
          {/* Wood grain pattern */}
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill={WOOD_COLORS.medium}/>
            <path d="M0,10 Q25,5 50,10 T100,10" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,30 Q25,25 50,30 T100,30" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,50 Q25,45 50,50 T100,50" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,70 Q25,65 50,70 T100,70" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,90 Q25,85 50,90 T100,90" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
          </pattern>

          {/* Board center gradient */}
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a2e" />
            <stop offset="50%" stopColor="#0f3020" />
            <stop offset="100%" stopColor="#1a4a2e" />
          </linearGradient>

          {/* Dice gradient */}
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>

          <filter id="dropShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4"/>
          </filter>
        </defs>

        {/* Outer wood border */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="url(#woodGrain)"
          rx="8"
        />

        {/* Dark edge on wood */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="none"
          stroke={WOOD_COLORS.dark}
          strokeWidth="4"
          rx="8"
        />

        {/* Inner wood border (between properties and green center) */}
        <rect
          x={innerBoardStart}
          y={innerBoardStart}
          width={innerBoardSize}
          height={innerBoardSize}
          fill="url(#woodGrain)"
          stroke={WOOD_COLORS.dark}
          strokeWidth="3"
        />

        {/* Green center */}
        <rect
          x={innerBoardStart + woodBorderWidth}
          y={innerBoardStart + woodBorderWidth}
          width={innerBoardSize - 2 * woodBorderWidth}
          height={innerBoardSize - 2 * woodBorderWidth}
          fill="url(#boardBg)"
        />

        {/* Center area content */}
        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          {/* Monopoly logo - bigger */}
          <text
            textAnchor="middle"
            y={-boardSize * 0.12}
            fontSize={boardSize * 0.06}
            fontWeight="bold"
            fill="#f59e0b"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="6"
          >
            MONOPOLY
          </text>

          {/* Dice area - bigger */}
          <g transform="translate(0, 10)">
            {/* Dice */}
            <g transform="translate(-35, -25)">
              <DiceFace value={displayDice[0]} size={55} isRolling={isRolling} />
            </g>
            <g transform="translate(35, -25)">
              <DiceFace value={displayDice[1]} size={55} isRolling={isRolling} />
            </g>

            {/* Speed die (if enabled) */}
            {gameState.settings?.speedDie && gameState.speedDie && (
              <g transform="translate(0, 45)">
                <SpeedDieFace value={gameState.speedDie} size={40} />
              </g>
            )}

            {/* Roll button - bigger */}
            {canRoll && isMyTurn && (
              <g
                transform="translate(0, 60)"
                onClick={handleRollDice}
                style={{ cursor: 'pointer' }}
                className="roll-button"
              >
                <rect
                  x="-55"
                  y="-16"
                  width="110"
                  height="32"
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth="2"
                  rx="16"
                  filter="url(#dropShadow)"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#1a1a1a"
                  fontWeight="bold"
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </text>
              </g>
            )}
          </g>

          {/* Current player indicator - bigger */}
          <g transform="translate(0, 120)">
            <rect
              x="-100"
              y="-16"
              width="200"
              height="32"
              fill="rgba(0, 0, 0, 0.4)"
              rx="16"
              stroke={TILE_COLORS.border}
              strokeWidth="1"
            />
            <circle cx="-75" cy="0" r="8" fill={currentPlayer?.color || '#666'}/>
            <text
              x="5"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fill={TILE_COLORS.text}
              fontWeight="600"
            >
              {currentPlayer?.name}'s Turn
            </text>
          </g>
        </g>

        {/* Board spaces */}
        {BOARD_SPACES.map((space) => {
          const pos = getSpacePosition(space.position);
          const propertyState = getPropertyState(space);
          const isCorner = space.position % 10 === 0;

          return (
            <g
              key={space.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onPropertyClick && onPropertyClick(space.id)}
              onMouseEnter={() => setHoveredSpace(space.id)}
              onMouseLeave={() => setHoveredSpace(null)}
              style={{ cursor: 'pointer' }}
              className="board-space"
            >
              {isCorner ? (
                renderCorner(space, pos)
              ) : (
                <>
                  {/* Space content (includes background) */}
                  {renderSpaceContent(space, pos)}

                  {/* Buildings (houses/hotel) */}
                  {renderBuildings(propertyState, pos, space)}

                  {/* Owner border */}
                  {renderOwnerBorder(propertyState, pos)}

                  {/* Mortgaged indicator */}
                  {renderMortgaged(propertyState, pos)}

                  {/* Price */}
                  {renderPrice(space, pos)}

                  {/* Hover tooltip */}
                  {renderTooltip(space, pos)}
                </>
              )}

              {/* Players on this space */}
              {renderPlayers(space.position, pos)}
            </g>
          );
        })}
      </svg>

      {/* Debug button */}
      <button
        className="debug-button"
        onClick={() => setShowDebugMenu(!showDebugMenu)}
      >
        Debug
      </button>

      {/* Debug menu */}
      {renderDebugMenu()}

      {/* Legend */}
      <div className="board-legend">
        <div className="legend-item">
          <span className="legend-house"></span>
          <span className="legend-label">House</span>
          <span className="legend-hotel"></span>
          <span className="legend-label">Hotel</span>
        </div>
      </div>
    </div>
  );
}
