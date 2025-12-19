// Random name generator for player placeholders
// Style: Adjective + Noun (e.g., "Golden Crown", "Silver Moon")

const ADJECTIVES = [
  'Golden', 'Silver', 'Crimson', 'Sapphire', 'Emerald', 'Mystic', 'Noble', 'Royal',
  'Shadow', 'Crystal', 'Radiant', 'Azure', 'Scarlet', 'Obsidian', 'Ivory', 'Velvet',
  'Amber', 'Cosmic', 'Stellar', 'Lunar', 'Solar', 'Phantom', 'Silent', 'Swift',
  'Fierce', 'Bold', 'Brave', 'Grand', 'Lucky', 'Mighty', 'Ancient', 'Eternal',
  'Iron', 'Steel', 'Thunder', 'Storm', 'Frost', 'Flame', 'Wild', 'Rogue',
  'Clever', 'Wise', 'Cunning', 'Daring', 'Fearless', 'Valiant', 'Proud', 'Elite',
  'Midnight', 'Twilight', 'Dawn', 'Dusk', 'Blazing', 'Frozen', 'Hidden', 'Secret'
];

const NOUNS = [
  'Crown', 'Moon', 'Star', 'Phoenix', 'Dragon', 'Knight', 'Castle', 'Fortune',
  'Legacy', 'Empire', 'Titan', 'Baron', 'Duke', 'Raven', 'Wolf', 'Lion',
  'Eagle', 'Hawk', 'Falcon', 'Serpent', 'Tiger', 'Panther', 'Ace', 'King',
  'Queen', 'Prince', 'Champion', 'Warrior', 'Guardian', 'Sentinel', 'Voyager', 'Pioneer',
  'Tycoon', 'Mogul', 'Venture', 'Summit', 'Horizon', 'Zenith', 'Oracle', 'Sage',
  'Hunter', 'Raider', 'Maverick', 'Legend', 'Hero', 'Victor', 'Chief', 'Captain',
  'Shadow', 'Spirit', 'Blade', 'Shield', 'Arrow', 'Spark', 'Ember', 'Storm'
];

export function generateRandomName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

export default generateRandomName;
