// Utility functions for formatting data

export function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

export function formatPlayerName(name, maxLength = 15) {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDice(dice) {
  if (!dice) return '';
  if (dice.length === 2) {
    return `${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}`;
  } else if (dice.length === 3) {
    const speedDieFace = typeof dice[2] === 'number' ? dice[2] : dice[2];
    return `${dice[0]}, ${dice[1]}, ${speedDieFace}`;
  }
  return '';
}

export function getColorGroupName(color) {
  const names = {
    brown: 'Brown',
    lightblue: 'Light Blue',
    pink: 'Pink',
    orange: 'Orange',
    red: 'Red',
    yellow: 'Yellow',
    green: 'Green',
    darkblue: 'Dark Blue',
    railroad: 'Railroad',
    utility: 'Utility'
  };
  return names[color] || color;
}

export function truncateMessage(message, maxLength = 100) {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
}

export function getPhaseDisplay(phase) {
  const phaseNames = {
    waiting: 'Waiting for players...',
    rolling: 'Roll the dice',
    buying: 'Buy or decline property',
    building: 'Manage properties',
    trading: 'Trading',
    auction: 'Auction in progress',
    bankrupt: 'Bankruptcy',
    ended: 'Game Over'
  };
  return phaseNames[phase] || phase;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    });
  }
}
