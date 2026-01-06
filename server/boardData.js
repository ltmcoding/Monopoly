// Complete Tycoon board data with all 40 spaces

const BOARD_SPACES = [
  {
    id: 0,
    name: "GO",
    type: "go",
    position: 0
  },
  {
    id: 1,
    name: "Lowell Cotton Mill",
    type: "property",
    color: "brown",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 30,
    position: 1
  },
  {
    id: 2,
    name: "Community Chest",
    type: "community_chest",
    position: 2
  },
  {
    id: 3,
    name: "Manchester Weaving Works",
    type: "property",
    color: "brown",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 30,
    position: 3
  },
  {
    id: 4,
    name: "Income Tax",
    type: "tax",
    amount: 200,
    position: 4
  },
  {
    id: 5,
    name: "Great Northern Railroad",
    type: "railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgageValue: 100,
    position: 5
  },
  {
    id: 6,
    name: "Appalachian Coal Co.",
    type: "property",
    color: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 50,
    position: 6
  },
  {
    id: 7,
    name: "Chance",
    type: "chance",
    position: 7
  },
  {
    id: 8,
    name: "Anthracite Ridge Mine",
    type: "property",
    color: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 50,
    position: 8
  },
  {
    id: 9,
    name: "Bituminous Valley Pit",
    type: "property",
    color: "lightblue",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 60,
    position: 9
  },
  {
    id: 10,
    name: "Just Visiting",
    type: "jail",
    position: 10
  },
  {
    id: 11,
    name: "Carnegie Steel Works",
    type: "property",
    color: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 70,
    position: 11
  },
  {
    id: 12,
    name: "Municipal Water Works",
    type: "utility",
    price: 150,
    mortgageValue: 75,
    position: 12
  },
  {
    id: 13,
    name: "Bethlehem Forge",
    type: "property",
    color: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 70,
    position: 13
  },
  {
    id: 14,
    name: "Pittsburgh Iron Foundry",
    type: "property",
    color: "pink",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 80,
    position: 14
  },
  {
    id: 15,
    name: "Southern Pacific Railroad",
    type: "railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgageValue: 100,
    position: 15
  },
  {
    id: 16,
    name: "Standard Oil Refinery",
    type: "property",
    color: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 90,
    position: 16
  },
  {
    id: 17,
    name: "Community Chest",
    type: "community_chest",
    position: 17
  },
  {
    id: 18,
    name: "Gulf Coast Petroleum",
    type: "property",
    color: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 90,
    position: 18
  },
  {
    id: 19,
    name: "Spindletop Crude Works",
    type: "property",
    color: "orange",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 100,
    position: 19
  },
  {
    id: 20,
    name: "Free Parking",
    type: "free_parking",
    position: 20
  },
  {
    id: 21,
    name: "Ford Assembly Plant",
    type: "property",
    color: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    position: 21
  },
  {
    id: 22,
    name: "Chance",
    type: "chance",
    position: 22
  },
  {
    id: 23,
    name: "General Motors Works",
    type: "property",
    color: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    position: 23
  },
  {
    id: 24,
    name: "Chrysler Production Line",
    type: "property",
    color: "red",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 120,
    position: 24
  },
  {
    id: 25,
    name: "Baltimore & Ohio Railroad",
    type: "railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgageValue: 100,
    position: 25
  },
  {
    id: 26,
    name: "Atlantic Trade Harbor",
    type: "property",
    color: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 130,
    position: 26
  },
  {
    id: 27,
    name: "Pacific Gateway Port",
    type: "property",
    color: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 130,
    position: 27
  },
  {
    id: 28,
    name: "City Gas Company",
    type: "utility",
    price: 150,
    mortgageValue: 75,
    position: 28
  },
  {
    id: 29,
    name: "Great Lakes Shipping Dock",
    type: "property",
    color: "yellow",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 140,
    position: 29
  },
  {
    id: 30,
    name: "Go To Jail",
    type: "go_to_jail",
    position: 30
  },
  {
    id: 31,
    name: "Edison Power Station",
    type: "property",
    color: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    position: 31
  },
  {
    id: 32,
    name: "Westinghouse Electric",
    type: "property",
    color: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    position: 32
  },
  {
    id: 33,
    name: "Community Chest",
    type: "community_chest",
    position: 33
  },
  {
    id: 34,
    name: "Tesla Generator Works",
    type: "property",
    color: "green",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 160,
    position: 34
  },
  {
    id: 35,
    name: "Union Pacific Railroad",
    type: "railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgageValue: 100,
    position: 35
  },
  {
    id: 36,
    name: "Chance",
    type: "chance",
    position: 36
  },
  {
    id: 37,
    name: "Bell Telephone Exchange",
    type: "property",
    color: "darkblue",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 175,
    position: 37
  },
  {
    id: 38,
    name: "Luxury Tax",
    type: "tax",
    amount: 100,
    position: 38
  },
  {
    id: 39,
    name: "Marconi Wireless Telegraph",
    type: "property",
    color: "darkblue",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 200,
    position: 39
  }
];

// Chance cards (16 total)
const CHANCE_CARDS = [
  {
    id: "chance_1",
    text: "Advance to GO. Collect $200.",
    action: "moveToSpace",
    data: { space: 0, collectGo: true }
  },
  {
    id: "chance_2",
    text: "Advance to Chrysler Production Line. If you pass GO, collect $200.",
    action: "moveToSpace",
    data: { space: 24, collectGo: true }
  },
  {
    id: "chance_3",
    text: "Advance to Carnegie Steel Works. If you pass GO, collect $200.",
    action: "moveToSpace",
    data: { space: 11, collectGo: true }
  },
  {
    id: "chance_4",
    text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, pay owner 10 times the dice roll.",
    action: "moveToNearestUtility",
    data: {}
  },
  {
    id: "chance_5",
    text: "Advance token to nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental.",
    action: "moveToNearestRailroad",
    data: {}
  },
  {
    id: "chance_6",
    text: "Advance token to nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental.",
    action: "moveToNearestRailroad",
    data: {}
  },
  {
    id: "chance_7",
    text: "Bank pays you dividend of $50.",
    action: "collectMoney",
    data: { amount: 50 }
  },
  {
    id: "chance_8",
    text: "Get Out of Jail Free. This card may be kept until needed or sold.",
    action: "getOutOfJailFree",
    data: {}
  },
  {
    id: "chance_9",
    text: "Go Back 3 Spaces.",
    action: "moveBackward",
    data: { spaces: 3 }
  },
  {
    id: "chance_10",
    text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200.",
    action: "goToJail",
    data: {}
  },
  {
    id: "chance_11",
    text: "Make general repairs on all your property. For each house pay $25, for each hotel pay $100.",
    action: "payRepairs",
    data: { perHouse: 25, perHotel: 100 }
  },
  {
    id: "chance_12",
    text: "Pay poor tax of $15.",
    action: "payMoney",
    data: { amount: 15 }
  },
  {
    id: "chance_13",
    text: "Take a trip to Great Northern Railroad. If you pass GO, collect $200.",
    action: "moveToSpace",
    data: { space: 5, collectGo: true }
  },
  {
    id: "chance_14",
    text: "Visit Marconi Wireless Telegraph. Advance token to Marconi.",
    action: "moveToSpace",
    data: { space: 39, collectGo: true }
  },
  {
    id: "chance_15",
    text: "You have been elected Chairman of the Board. Pay each player $50.",
    action: "payEachPlayer",
    data: { amount: 50 }
  },
  {
    id: "chance_16",
    text: "Your building loan matures. Collect $150.",
    action: "collectMoney",
    data: { amount: 150 }
  }
];

// Community Chest cards (16 total)
const COMMUNITY_CHEST_CARDS = [
  {
    id: "cc_1",
    text: "Advance to GO. Collect $200.",
    action: "moveToSpace",
    data: { space: 0, collectGo: true }
  },
  {
    id: "cc_2",
    text: "Bank error in your favor. Collect $200.",
    action: "collectMoney",
    data: { amount: 200 }
  },
  {
    id: "cc_3",
    text: "Doctor's fees. Pay $50.",
    action: "payMoney",
    data: { amount: 50 }
  },
  {
    id: "cc_4",
    text: "From sale of stock you get $50.",
    action: "collectMoney",
    data: { amount: 50 }
  },
  {
    id: "cc_5",
    text: "Get Out of Jail Free. This card may be kept until needed or sold.",
    action: "getOutOfJailFree",
    data: {}
  },
  {
    id: "cc_6",
    text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200.",
    action: "goToJail",
    data: {}
  },
  {
    id: "cc_7",
    text: "Grand Opera Night. Collect $50 from every player for opening night seats.",
    action: "collectFromEachPlayer",
    data: { amount: 50 }
  },
  {
    id: "cc_8",
    text: "Holiday Fund matures. Receive $100.",
    action: "collectMoney",
    data: { amount: 100 }
  },
  {
    id: "cc_9",
    text: "Income tax refund. Collect $20.",
    action: "collectMoney",
    data: { amount: 20 }
  },
  {
    id: "cc_10",
    text: "It is your birthday. Collect $10 from every player.",
    action: "collectFromEachPlayer",
    data: { amount: 10 }
  },
  {
    id: "cc_11",
    text: "Life insurance matures. Collect $100.",
    action: "collectMoney",
    data: { amount: 100 }
  },
  {
    id: "cc_12",
    text: "Hospital fees. Pay $100.",
    action: "payMoney",
    data: { amount: 100 }
  },
  {
    id: "cc_13",
    text: "School fees. Pay $150.",
    action: "payMoney",
    data: { amount: 150 }
  },
  {
    id: "cc_14",
    text: "Receive $25 consultancy fee.",
    action: "collectMoney",
    data: { amount: 25 }
  },
  {
    id: "cc_15",
    text: "You are assessed for street repairs. Pay $40 per house and $115 per hotel you own.",
    action: "payRepairs",
    data: { perHouse: 40, perHotel: 115 }
  },
  {
    id: "cc_16",
    text: "You have won second prize in a beauty contest. Collect $10.",
    action: "collectMoney",
    data: { amount: 10 }
  }
];

// Color groups for property sets
const COLOR_GROUPS = {
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

module.exports = {
  BOARD_SPACES,
  CHANCE_CARDS,
  COMMUNITY_CHEST_CARDS,
  COLOR_GROUPS
};
