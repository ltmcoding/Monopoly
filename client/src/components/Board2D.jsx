import React, { useState, useEffect, useRef } from 'react';
import { BOARD_SPACES, COLOR_MAP, getSpaceById } from '../utils/boardData';

// Enhanced property colors (darker/richer for dark mode)
const ENHANCED_COLORS = {
  brown: '#8B5A2B',
  lightblue: '#5DADE2',
  pink: '#E066A6',
  orange: '#E59035',
  red: '#E74C3C',
  yellow: '#F4D03F',
  green: '#27AE60',
  darkblue: '#2874A6',
  railroad: '#4a4a4a',
  utility: '#6c757d'
};

// Dark mode tile colors
const TILE_COLORS = {
  background: '#1c2128',
  backgroundCorner: '#161b22',
  text: '#e6edf3',
  textMuted: '#8b949e',
  price: '#3fb950',
  border: '#30363d',
};

// Game piece token SVG paths
const GAME_PIECES = {
  car: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <path d="M2,8 L2,6 Q2,4 4,4 L8,4 L10,2 L16,2 L18,4 L22,4 Q24,4 24,6 L24,8 L22,8 L22,10 L4,10 L4,8 Z" />
      <circle cx="7" cy="10" r="2" fill="#333" stroke="none"/>
      <circle cx="19" cy="10" r="2" fill="#333" stroke="none"/>
      <rect x="10" y="3" width="5" height="2" fill="#87CEEB" stroke="none"/>
    </g>
  ),
  hat: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <ellipse cx="12" cy="11" rx="11" ry="2"/>
      <rect x="6" y="3" width="12" height="8" rx="1"/>
      <rect x="8" y="1" width="8" height="3"/>
      <rect x="4" y="10" width="16" height="2" rx="1"/>
    </g>
  ),
  dog: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <ellipse cx="12" cy="8" rx="6" ry="4"/>
      <circle cx="18" cy="5" r="3"/>
      <polygon points="19,3 22,1 21,4"/>
      <polygon points="17,3 14,1 15,4"/>
      <rect x="8" y="10" width="2" height="4" rx="1"/>
      <rect x="14" y="10" width="2" height="4" rx="1"/>
      <path d="M4,8 Q2,8 2,10 L4,10" fill={color}/>
      <circle cx="19" cy="5" r="1" fill="#000"/>
    </g>
  ),
  ship: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <path d="M2,10 L4,6 L20,6 L22,10 L12,12 Z"/>
      <rect x="10" y="2" width="4" height="4"/>
      <rect x="6" y="4" width="3" height="2"/>
      <rect x="15" y="4" width="3" height="2"/>
      <line x1="12" y1="2" x2="12" y2="0" stroke={color} strokeWidth="1"/>
    </g>
  ),
  thimble: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <path d="M6,12 L6,6 Q6,2 12,2 Q18,2 18,6 L18,12 Q18,14 12,14 Q6,14 6,12 Z"/>
      <ellipse cx="12" cy="3" rx="5" ry="1.5" fill="#ddd"/>
      {[0,1,2,3].map(row =>
        [0,1,2,3,4].map(col => (
          <circle key={`${row}-${col}`} cx={8 + col*1.5 - (row%2)*0.75} cy={5 + row*2} r="0.5" fill="#333"/>
        ))
      )}
    </g>
  ),
  wheelbarrow: (color) => (
    <g fill={color} stroke="#000" strokeWidth="0.5">
      <path d="M4,4 L8,4 L10,8 L18,8 L18,10 L8,10 Z"/>
      <line x1="18" y1="9" x2="24" y2="6" strokeWidth="1"/>
      <line x1="18" y1="9" x2="24" y2="12" strokeWidth="1"/>
      <circle cx="6" cy="11" r="2" fill="#333"/>
    </g>
  ),
};

const TOKEN_TYPES = ['car', 'hat', 'dog', 'ship', 'thimble', 'wheelbarrow'];

// Dice pip positions (normalized 0-1)
const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

// Dice face component with pips
const DiceFace = ({ value, size, isRolling }) => {
  const pips = PIP_POSITIONS[value] || [];
  const pipRadius = size * 0.08;

  return (
    <g className={isRolling ? 'dice-rolling' : ''}>
      <rect
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="#fefefe"
        stroke="#333"
        strokeWidth="2"
        rx={size * 0.15}
      />
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
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="#2ecc71"
        stroke="#27ae60"
        strokeWidth="2"
        rx={size * 0.15}
      />
      {typeof value === 'number' ? (
        PIP_POSITIONS[value]?.map(([px, py], idx) => (
          <circle
            key={idx}
            cx={-size/2 + px * size}
            cy={-size/2 + py * size}
            r={size * 0.08}
            fill="#fff"
          />
        ))
      ) : value === 'Bus' ? (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.4} fill="#fff" fontWeight="bold">BUS</text>
      ) : (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.35} fill="#fff" fontWeight="bold">MR.M</text>
      )}
    </g>
  );
};

// House icon component
const HouseIcon = ({ x, y, size = 10 }) => (
  <g transform={`translate(${x - size/2}, ${y - size/2})`}>
    <path
      d={`M${size/2},0 L${size},${size*0.4} L${size},${size} L0,${size} L0,${size*0.4} Z`}
      fill="#22c55e"
      stroke="#15803d"
      strokeWidth="1"
    />
  </g>
);

// Hotel icon component
const HotelIcon = ({ x, y, size = 14 }) => (
  <g transform={`translate(${x - size/2}, ${y - size*0.35})`}>
    <rect width={size} height={size * 0.7} rx="1" fill="#ef4444" stroke="#b91c1c" strokeWidth="1"/>
    <text x={size/2} y={size * 0.45} textAnchor="middle" fontSize={size * 0.4} fill="white" fontWeight="bold">H</text>
  </g>
);

// Corner space renderers
const renderGoCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border}/>
    {/* Red arrow */}
    <g transform={`translate(${size/2}, ${size/2})`}>
      <polygon
        points="-20,-8 10,-8 10,-15 25,0 10,15 10,8 -20,8"
        fill="#e74c3c"
        stroke="#c0392b"
        strokeWidth="1"
      />
      <text y="-20" textAnchor="middle" fontSize="10" fill="#e74c3c" fontWeight="bold">GO</text>
      <text y="30" textAnchor="middle" fontSize="7" fill={TILE_COLORS.price}>COLLECT $200</text>
    </g>
  </g>
);

const renderJailCorner = (size, playersInJail = []) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border}/>
    {/* Just Visiting section */}
    <text x={size * 0.2} y={size * 0.9} fontSize="6" fill={TILE_COLORS.textMuted} transform={`rotate(-45, ${size * 0.2}, ${size * 0.9})`}>
      JUST VISITING
    </text>
    {/* Jail cell */}
    <rect x={size * 0.35} y={size * 0.1} width={size * 0.55} height={size * 0.55} fill="#4a4a4a" stroke="#333" strokeWidth="2"/>
    {/* Bars */}
    {[0.4, 0.5, 0.6, 0.7, 0.8].map((xPos, i) => (
      <line key={i} x1={size * xPos} y1={size * 0.1} x2={size * xPos} y2={size * 0.65} stroke="#888" strokeWidth="3"/>
    ))}
    <text x={size * 0.62} y={size * 0.4} textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="bold">IN JAIL</text>
  </g>
);

const renderFreeParkingCorner = (size, potAmount = 0) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border}/>
    <g transform={`translate(${size/2}, ${size/2 - 5})`}>
      {/* Car icon */}
      <g transform="scale(1.5) translate(-12, -6)">
        <path d="M2,8 L2,6 Q2,4 4,4 L8,4 L10,2 L16,2 L18,4 L22,4 Q24,4 24,6 L24,8 L22,8 L22,10 L4,10 L4,8 Z" fill="#e74c3c" stroke="#c0392b" strokeWidth="0.5"/>
        <circle cx="7" cy="10" r="2" fill="#333"/>
        <circle cx="19" cy="10" r="2" fill="#333"/>
      </g>
      <text y="-25" textAnchor="middle" fontSize="8" fill={TILE_COLORS.text} fontWeight="bold">FREE</text>
      <text y="-15" textAnchor="middle" fontSize="8" fill={TILE_COLORS.text} fontWeight="bold">PARKING</text>
      {potAmount > 0 && (
        <text y="35" textAnchor="middle" fontSize="9" fill={TILE_COLORS.price} fontWeight="bold">${potAmount}</text>
      )}
    </g>
  </g>
);

const renderGoToJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border}/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      {/* Police officer pointing */}
      <circle cx="0" cy="-15" r="8" fill="#3498db"/>
      <rect x="-6" y="-8" width="12" height="15" fill="#3498db"/>
      <circle cx="0" cy="-15" r="5" fill="#fad7a0"/>
      {/* Pointing arm */}
      <line x1="6" y1="-5" x2="20" y2="-15" stroke="#fad7a0" strokeWidth="3" strokeLinecap="round"/>
      <text y="20" textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">GO TO</text>
      <text y="30" textAnchor="middle" fontSize="7" fill={TILE_COLORS.text} fontWeight="bold">JAIL</text>
    </g>
  </g>
);

// Special space icons
const renderChanceIcon = (w, h) => (
  <g transform={`translate(${w/2}, ${h/2})`}>
    <rect x="-12" y="-15" width="24" height="20" fill="#f39c12" stroke="#e67e22" strokeWidth="1" rx="2"/>
    <text textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#fff" fontWeight="bold">?</text>
  </g>
);

const renderCommunityChestIcon = (w, h) => (
  <g transform={`translate(${w/2}, ${h/2})`}>
    {/* Treasure chest */}
    <rect x="-10" y="-5" width="20" height="12" fill="#3498db" stroke="#2980b9" strokeWidth="1" rx="2"/>
    <path d="M-10,-5 Q0,-12 10,-5" fill="#3498db" stroke="#2980b9" strokeWidth="1"/>
    <rect x="-2" y="-2" width="4" height="4" fill="#f1c40f" rx="1"/>
  </g>
);

const renderTaxIcon = (w, h, amount) => (
  <g transform={`translate(${w/2}, ${h/2 - 5})`}>
    <polygon points="0,-12 10,8 -10,8" fill="#9b59b6" stroke="#8e44ad" strokeWidth="1"/>
    <text y="20" textAnchor="middle" fontSize="8" fill={TILE_COLORS.price} fontWeight="bold">${amount}</text>
  </g>
);

const renderRailroadIcon = (w, h) => (
  <g transform={`translate(${w/2}, ${h/2 - 8})`}>
    {/* Steam train silhouette */}
    <rect x="-12" y="0" width="24" height="10" fill="#4a4a4a" rx="2"/>
    <rect x="-15" y="2" width="6" height="8" fill="#4a4a4a"/>
    <circle cx="-12" cy="12" r="3" fill="#333"/>
    <circle cx="0" cy="12" r="3" fill="#333"/>
    <circle cx="10" cy="12" r="3" fill="#333"/>
    <rect x="-8" y="-5" width="8" height="5" fill="#e74c3c"/>
  </g>
);

const renderUtilityIcon = (w, h, isElectric) => (
  <g transform={`translate(${w/2}, ${h/2 - 5})`}>
    {isElectric ? (
      // Lightning bolt
      <polygon points="0,-15 8,0 2,0 6,15 -6,0 0,0" fill="#f1c40f" stroke="#f39c12" strokeWidth="1"/>
    ) : (
      // Water droplet
      <path d="M0,-12 Q10,5 0,12 Q-10,5 0,-12" fill="#3498db" stroke="#2980b9" strokeWidth="1"/>
    )}
  </g>
);

export default function Board2D({
  gameState,
  onPropertyClick,
  onRollDice,
  isMyTurn = false,
  canRoll = false,
  myPlayerId = null
}) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(800);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(gameState?.dice || [1, 1]);
  const [hoveredSpace, setHoveredSpace] = useState(null);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.game-center');
      if (container) {
        const maxSize = Math.min(container.clientWidth - 40, container.clientHeight - 40, 900);
        setBoardSize(Math.max(maxSize, 600));
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

  // Scaled dimensions
  const cornerSize = Math.round(boardSize * 0.12);
  const colorBarHeight = Math.round(boardSize * 0.018);
  const sideSpaces = 9;
  const spaceWidth = (boardSize - 2 * cornerSize) / sideSpaces;

  // Calculate position for each space
  const getSpacePosition = (position) => {
    if (position === 0) {
      return { x: boardSize - cornerSize, y: boardSize - cornerSize, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 0 && position < 10) {
      return {
        x: boardSize - cornerSize - (position * spaceWidth),
        y: boardSize - cornerSize,
        w: spaceWidth,
        h: cornerSize,
        rotation: 0,
        colorBarSide: 'top'
      };
    } else if (position === 10) {
      return { x: 0, y: boardSize - cornerSize, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 10 && position < 20) {
      const idx = position - 10;
      return {
        x: 0,
        y: boardSize - cornerSize - (idx * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        rotation: 90,
        colorBarSide: 'right'
      };
    } else if (position === 20) {
      return { x: 0, y: 0, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else if (position > 20 && position < 30) {
      const idx = position - 20;
      return {
        x: cornerSize + ((idx - 1) * spaceWidth),
        y: 0,
        w: spaceWidth,
        h: cornerSize,
        rotation: 180,
        colorBarSide: 'bottom'
      };
    } else if (position === 30) {
      return { x: boardSize - cornerSize, y: 0, w: cornerSize, h: cornerSize, rotation: 0, isCorner: true };
    } else {
      const idx = position - 30;
      return {
        x: boardSize - cornerSize,
        y: cornerSize + ((idx - 1) * spaceWidth),
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

  const getPlayerToken = (playerIndex) => {
    return TOKEN_TYPES[playerIndex % TOKEN_TYPES.length];
  };

  // Handle dice roll with animation
  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;

    setIsRolling(true);

    // Animate random dice faces
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

    // Call the actual roll
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
      />
    );
  };

  // Render houses/hotel on color bar
  const renderBuildings = (propertyState, pos, space) => {
    if (!propertyState || !space.color) return null;

    const hasHotel = propertyState.hotels > 0;
    const houses = propertyState.houses;

    if (!hasHotel && houses === 0) return null;

    // Position on color bar based on side
    let buildingX, buildingY;
    switch(pos.colorBarSide) {
      case 'top':
        buildingX = pos.w / 2;
        buildingY = colorBarHeight / 2;
        break;
      case 'bottom':
        buildingX = pos.w / 2;
        buildingY = pos.h - colorBarHeight / 2;
        break;
      case 'left':
        buildingX = colorBarHeight / 2;
        buildingY = pos.h / 2;
        break;
      case 'right':
        buildingX = pos.w - colorBarHeight / 2;
        buildingY = pos.h / 2;
        break;
      default:
        return null;
    }

    if (hasHotel) {
      return <HotelIcon x={buildingX} y={buildingY} size={colorBarHeight * 1.2} />;
    }

    return (
      <g>
        <HouseIcon x={buildingX - 8} y={buildingY} size={colorBarHeight * 0.9} />
        {houses > 1 && (
          <text
            x={buildingX + 5}
            y={buildingY + 3}
            fontSize={colorBarHeight * 0.7}
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
        x={2}
        y={2}
        width={pos.w - 4}
        height={pos.h - 4}
        fill="none"
        stroke={ownerColor}
        strokeWidth="3"
        rx="2"
        opacity="0.8"
      />
    );
  };

  // Render mortgaged indicator
  const renderMortgaged = (propertyState, pos) => {
    if (!propertyState?.mortgaged) return null;

    return (
      <>
        <rect x={0} y={0} width={pos.w} height={pos.h} fill="rgba(0,0,0,0.5)"/>
        <text x={pos.w/2} y={pos.h/2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#ef4444" fontWeight="bold">
          MORTGAGED
        </text>
      </>
    );
  };

  // Render player tokens on a space
  const renderPlayers = (position, pos) => {
    const players = getPlayersOnSpace(position);
    if (players.length === 0) return null;

    const tokenSize = Math.min(pos.w, pos.h) * 0.3;
    const centerX = pos.w / 2;
    const centerY = pos.h / 2 + (pos.colorBarSide === 'top' ? colorBarHeight / 2 : 0);

    // Calculate positions for multiple tokens (fan out from center)
    const getTokenPosition = (index, total) => {
      if (total === 1) return { x: centerX, y: centerY };
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radius = tokenSize * 0.6;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    };

    const currentPlayerIndex = gameState.currentPlayerIndex;
    const currentPlayerId = gameState.players[currentPlayerIndex]?.id;

    return players.map((player, idx) => {
      const playerIndex = gameState.players.findIndex(p => p.id === player.id);
      const tokenType = getPlayerToken(playerIndex);
      const tokenPos = getTokenPosition(idx, players.length);
      const isCurrentPlayer = player.id === currentPlayerId;
      const TokenComponent = GAME_PIECES[tokenType];

      return (
        <g
          key={player.id}
          transform={`translate(${tokenPos.x}, ${tokenPos.y})`}
          className={isCurrentPlayer ? 'current-player-token' : ''}
        >
          {/* Drop shadow */}
          <ellipse cx={2} cy={tokenSize/2 + 2} rx={tokenSize/3} ry={tokenSize/6} fill="rgba(0,0,0,0.3)"/>

          {/* Token */}
          <g transform={`scale(${tokenSize / 26})`}>
            {TokenComponent && TokenComponent(player.color)}
          </g>

          {/* Current player glow */}
          {isCurrentPlayer && (
            <circle cx={0} cy={0} r={tokenSize/2 + 3} fill="none" stroke="#f59e0b" strokeWidth="2" className="player-glow"/>
          )}

          {/* In jail indicator */}
          {player.inJail && position === 10 && (
            <text x={0} y={-tokenSize/2 - 5} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="bold">
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
    if (isCorner) return null; // Corners handled separately

    // Special space icons
    if (space.type === 'chance') return renderChanceIcon(pos.w, pos.h);
    if (space.type === 'community_chest') return renderCommunityChestIcon(pos.w, pos.h);
    if (space.type === 'tax') return renderTaxIcon(pos.w, pos.h, space.amount);
    if (space.type === 'railroad') return renderRailroadIcon(pos.w, pos.h);
    if (space.type === 'utility') return renderUtilityIcon(pos.w, pos.h, space.id === 12);

    // Property name
    const lines = space.name.split(' ');
    const displayLines = lines.length > 2 ? [lines.slice(0, -1).join(' '), lines[lines.length - 1]] : lines;

    return (
      <g>
        {displayLines.map((line, i) => (
          <text
            key={i}
            x={pos.w / 2}
            y={pos.h / 2 - 5 + i * 10}
            textAnchor="middle"
            fontSize="7"
            fill={TILE_COLORS.text}
            fontWeight="500"
          >
            {line.length > 12 ? line.substring(0, 11) + '…' : line}
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
        y={pos.h - 8}
        textAnchor="middle"
        fontSize="8"
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
      <g transform={`translate(${pos.w/2}, ${-35})`} className="rent-tooltip">
        <rect x="-50" y="-25" width="100" height="50" fill="rgba(0,0,0,0.95)" rx="6"/>
        <text x="0" y="-10" textAnchor="middle" fontSize="9" fill="#e6edf3">
          Rent: ${currentRent}
        </text>
        {owner && (
          <text x="0" y="5" textAnchor="middle" fontSize="8" fill={owner.color}>
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
      case 10: return renderJailCorner(pos.w, gameState.players.filter(p => p.inJail));
      case 20: return renderFreeParkingCorner(pos.w, gameState.freeParkingPot || 0);
      case 30: return renderGoToJailCorner(pos.w);
      default: return null;
    }
  };

  // Get current player for turn display
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="board-2d" ref={containerRef}>
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Definitions */}
        <defs>
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="50%" stopColor="#0f2820" />
            <stop offset="100%" stopColor="#1a3a2a" />
          </linearGradient>
          <filter id="dropShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
          <filter id="playerGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer border */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="#0d1117"
          rx="12"
        />

        {/* Inner board */}
        <rect
          x={cornerSize}
          y={cornerSize}
          width={boardSize - 2 * cornerSize}
          height={boardSize - 2 * cornerSize}
          fill="url(#boardBg)"
        />

        {/* Center area */}
        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          {/* Monopoly logo */}
          <text
            textAnchor="middle"
            y={-60}
            fontSize={boardSize * 0.05}
            fontWeight="bold"
            fill="#f59e0b"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="4"
          >
            MONOPOLY
          </text>

          {/* Dice area */}
          <g transform="translate(0, 0)">
            {/* Dice */}
            <g transform={`translate(-25, -20)`}>
              <DiceFace value={displayDice[0]} size={40} isRolling={isRolling} />
            </g>
            <g transform={`translate(25, -20)`}>
              <DiceFace value={displayDice[1]} size={40} isRolling={isRolling} />
            </g>

            {/* Speed die (if enabled) */}
            {gameState.settings?.speedDie && gameState.speedDie && (
              <g transform="translate(0, 35)">
                <SpeedDieFace value={gameState.speedDie} size={30} />
              </g>
            )}

            {/* Roll button */}
            {canRoll && isMyTurn && (
              <g
                transform="translate(0, 50)"
                onClick={handleRollDice}
                style={{ cursor: 'pointer' }}
                className="roll-button"
              >
                <rect
                  x="-45"
                  y="-12"
                  width="90"
                  height="24"
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth="2"
                  rx="12"
                  filter="url(#dropShadow)"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#1a1a1a"
                  fontWeight="bold"
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </text>
              </g>
            )}
          </g>

          {/* Current player indicator */}
          <g transform="translate(0, 95)">
            <rect
              x="-80"
              y="-12"
              width="160"
              height="24"
              fill="rgba(0, 0, 0, 0.3)"
              rx="12"
            />
            <circle cx="-60" cy="0" r="6" fill={currentPlayer?.color || '#666'}/>
            <text
              x="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill={TILE_COLORS.text}
              fontWeight="600"
            >
              {currentPlayer?.name}'s Turn
            </text>
          </g>

          {/* Turn timer (placeholder - implement with actual timer state) */}
          {gameState.turnTimeRemaining !== undefined && (
            <g transform="translate(0, -100)">
              <circle
                cx="0" cy="0" r="25"
                fill="none"
                stroke={gameState.turnTimeRemaining > 15 ? '#f59e0b' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={Math.PI * 50}
                strokeDashoffset={Math.PI * 50 * (1 - gameState.turnTimeRemaining / 60)}
                transform="rotate(-90)"
              />
              <text textAnchor="middle" dominantBaseline="middle" fontSize="14" fill={TILE_COLORS.text} fontWeight="bold">
                {gameState.turnTimeRemaining}s
              </text>
            </g>
          )}
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
                  {/* Space background */}
                  <rect
                    width={pos.w}
                    height={pos.h}
                    fill={TILE_COLORS.background}
                    stroke={TILE_COLORS.border}
                    strokeWidth="1"
                  />

                  {/* Color bar for properties */}
                  {renderColorBar(space, pos)}

                  {/* Buildings (houses/hotel) */}
                  {renderBuildings(propertyState, pos, space)}

                  {/* Owner border */}
                  {renderOwnerBorder(propertyState, pos)}

                  {/* Mortgaged indicator */}
                  {renderMortgaged(propertyState, pos)}

                  {/* Space content */}
                  {renderSpaceContent(space, pos)}

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
