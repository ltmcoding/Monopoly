// Complete Monopoly board data for client (matches server)

export const BOARD_SPACES = [
  { id: 0, name: "GO", type: "go", position: 0 },
  { id: 1, name: "Mediterranean Avenue", type: "property", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, hotelCost: 50, mortgageValue: 30, position: 1 },
  { id: 2, name: "Community Chest", type: "community_chest", position: 2 },
  { id: 3, name: "Baltic Avenue", type: "property", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, hotelCost: 50, mortgageValue: 30, position: 3 },
  { id: 4, name: "Income Tax", type: "tax", amount: 200, position: 4 },
  { id: 5, name: "Reading Railroad", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, position: 5 },
  { id: 6, name: "Oriental Avenue", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, hotelCost: 50, mortgageValue: 50, position: 6 },
  { id: 7, name: "Chance", type: "chance", position: 7 },
  { id: 8, name: "Vermont Avenue", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, hotelCost: 50, mortgageValue: 50, position: 8 },
  { id: 9, name: "Connecticut Avenue", type: "property", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, hotelCost: 50, mortgageValue: 60, position: 9 },
  { id: 10, name: "Just Visiting", type: "jail", position: 10 },
  { id: 11, name: "St. Charles Place", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, hotelCost: 100, mortgageValue: 70, position: 11 },
  { id: 12, name: "Electric Company", type: "utility", price: 150, mortgageValue: 75, position: 12 },
  { id: 13, name: "States Avenue", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, hotelCost: 100, mortgageValue: 70, position: 13 },
  { id: 14, name: "Virginia Avenue", type: "property", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, hotelCost: 100, mortgageValue: 80, position: 14 },
  { id: 15, name: "Pennsylvania Railroad", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, position: 15 },
  { id: 16, name: "St. James Place", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, hotelCost: 100, mortgageValue: 90, position: 16 },
  { id: 17, name: "Community Chest", type: "community_chest", position: 17 },
  { id: 18, name: "Tennessee Avenue", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, hotelCost: 100, mortgageValue: 90, position: 18 },
  { id: 19, name: "New York Avenue", type: "property", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, hotelCost: 100, mortgageValue: 100, position: 19 },
  { id: 20, name: "Free Parking", type: "free_parking", position: 20 },
  { id: 21, name: "Kentucky Avenue", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, hotelCost: 150, mortgageValue: 110, position: 21 },
  { id: 22, name: "Chance", type: "chance", position: 22 },
  { id: 23, name: "Indiana Avenue", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, hotelCost: 150, mortgageValue: 110, position: 23 },
  { id: 24, name: "Illinois Avenue", type: "property", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, hotelCost: 150, mortgageValue: 120, position: 24 },
  { id: 25, name: "B&O Railroad", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, position: 25 },
  { id: 26, name: "Atlantic Avenue", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, hotelCost: 150, mortgageValue: 130, position: 26 },
  { id: 27, name: "Ventnor Avenue", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, hotelCost: 150, mortgageValue: 130, position: 27 },
  { id: 28, name: "Water Works", type: "utility", price: 150, mortgageValue: 75, position: 28 },
  { id: 29, name: "Marvin Gardens", type: "property", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, hotelCost: 150, mortgageValue: 140, position: 29 },
  { id: 30, name: "Go To Jail", type: "go_to_jail", position: 30 },
  { id: 31, name: "Pacific Avenue", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, hotelCost: 200, mortgageValue: 150, position: 31 },
  { id: 32, name: "North Carolina Avenue", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, hotelCost: 200, mortgageValue: 150, position: 32 },
  { id: 33, name: "Community Chest", type: "community_chest", position: 33 },
  { id: 34, name: "Pennsylvania Avenue", type: "property", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, hotelCost: 200, mortgageValue: 160, position: 34 },
  { id: 35, name: "Short Line Railroad", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, position: 35 },
  { id: 36, name: "Chance", type: "chance", position: 36 },
  { id: 37, name: "Park Place", type: "property", color: "darkblue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, hotelCost: 200, mortgageValue: 175, position: 37 },
  { id: 38, name: "Luxury Tax", type: "tax", amount: 100, position: 38 },
  { id: 39, name: "Boardwalk", type: "property", color: "darkblue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, hotelCost: 200, mortgageValue: 200, position: 39 }
];

export const COLOR_GROUPS = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
  railroad: [5, 15, 25, 35],
  utility: [12, 28]
};

export const COLOR_MAP = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFFF00',
  green: '#008000',
  darkblue: '#00008B',
  railroad: '#000000',
  utility: '#FFFFFF'
};

export function getSpaceById(id) {
  return BOARD_SPACES.find(space => space.id === id);
}

export function getSpaceByPosition(position) {
  return BOARD_SPACES.find(space => space.position === position);
}
