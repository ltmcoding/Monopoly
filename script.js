document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');

    const spaces = [
        { name: 'Go', type: 'corner' },
        { name: 'Mediterranean Avenue', group: 'Brown', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, color: '#964B00' },
        { name: 'Community Chest', type: 'chest' },
        { name: 'Baltic Avenue', group: 'Brown', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, color: '#964B00' },
        { name: 'Income Tax', type: 'tax', taxAmount: 200 },
        { name: 'Reading Railroad', group: 'Railroad', price: 200, rent: [25, 50, 100, 200], type: 'railroad' },
        { name: 'Oriental Avenue', group: 'Light Blue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: '#A4DDED' },
        { name: 'Chance', type: 'chance' },
        { name: 'Vermont Avenue', group: 'Light Blue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: '#A4DDED' },
        { name: 'Connecticut Avenue', group: 'Light Blue', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, color: '#A4DDED' },
        { name: 'Jail', type: 'corner' },
        { name: 'St. Charles Place', group: 'Pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: '#F0A3F0' },
        { name: 'Electric Company', group: 'Utility', price: 150, type: 'utility' },
        { name: 'States Avenue', group: 'Pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: '#F0A3F0' },
        { name: 'Virginia Avenue', group: 'Pink', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, color: '#F0A3F0' },
        { name: 'Pennsylvania Railroad', group: 'Railroad', price: 200, rent: [25, 50, 100, 200], type: 'railroad' },
        { name: 'St. James Place', group: 'Orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: '#FF851B' },
        { name: 'Community Chest', type: 'chest' },
        { name: 'Tennessee Avenue', group: 'Orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: '#FF851B' },
        { name: 'New York Avenue', group: 'Orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, color: '#FF851B' },
        { name: 'Free Parking', type: 'corner' },
        { name: 'Kentucky Avenue', group: 'Red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: '#FF4136' },
        { name: 'Chance', type: 'chance' },
        { name: 'Indiana Avenue', group: 'Red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: '#FF4136' },
        { name: 'Illinois Avenue', group: 'Red', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, color: '#FF4136' },
        { name: 'B. & O. Railroad', group: 'Railroad', price: 200, rent: [25, 50, 100, 200], type: 'railroad' },
        { name: 'Atlantic Avenue', group: 'Yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: '#FFDC00' },
        { name: 'Ventnor Avenue', group: 'Yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: '#FFDC00' },
        { name: 'Water Works', group: 'Utility', price: 150, type: 'utility' },
        { name: 'Marvin Gardens', group: 'Yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, color: '#FFDC00' },
        { name: 'Go to Jail', type: 'corner' },
        { name: 'Pacific Avenue', group: 'Green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: '#2ECC40' },
        { name: 'North Carolina Avenue', group: 'Green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: '#2ECC40' },
        { name: 'Community Chest', type: 'chest' },
        { name: 'Pennsylvania Avenue', group: 'Green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, color: '#2ECC40' },
        { name: 'Short Line', group: 'Railroad', price: 200, rent: [25, 50, 100, 200], type: 'railroad' },
        { name: 'Chance', type: 'chance' },
        { name: 'Park Place', group: 'Dark Blue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, color: '#0074D9' },
        { name: 'Luxury Tax', type: 'tax', taxAmount: 100 },
        { name: 'Boardwalk', group: 'Dark Blue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, color: '#0074D9' },
    ];

    const players = [
        { id: 1, name: 'Player 1', position: 0, money: 1500, color: '#FF4136', inJail: false, jailTurns: 0, getOutOfJailFreeCards: 0, doublesCount: 0 },
        { id: 2, name: 'Player 2', position: 0, money: 1500, color: '#0074D9', inJail: false, jailTurns: 0, getOutOfJailFreeCards: 0, doublesCount: 0 },
        { id: 3, name: 'Player 3', position: 0, money: 1500, color: '#2ECC40', inJail: false, jailTurns: 0, getOutOfJailFreeCards: 0, doublesCount: 0 },
        { id: 4, name: 'Player 4', position: 0, money: 1500, color: '#FFDC00', inJail: false, jailTurns: 0, getOutOfJailFreeCards: 0, doublesCount: 0 }
    ];

    spaces.forEach(space => {
        if (space.price) {
            space.owner = null;
            space.isMortgaged = false;
            space.houses = 0;
        }
    });

    let activePlayerIndex = 0;
    let currentTrade = {};

    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const endTurnBtn = document.getElementById('end-turn-btn');
    const diceResultDiv = document.getElementById('dice-result');
    const playerInfoDiv = document.getElementById('player-info');
    const actionMenu = document.getElementById('action-menu');
    const managePropertiesBtn = document.getElementById('manage-properties-btn');
    const modal = document.getElementById('manage-properties-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalPropertiesList = document.getElementById('modal-properties-list');
    const cardModal = document.getElementById('card-modal');
    const cardModalTitle = document.getElementById('card-modal-title');
    const cardModalText = document.getElementById('card-modal-text');
    const cardModalOkBtn = document.getElementById('card-modal-ok');
    const proposeTradeBtn = document.getElementById('propose-trade-btn');
    const tradeModal = document.getElementById('trade-modal');
    const viewTradeModal = document.getElementById('view-trade-modal');

    let chanceDeck = [];
    let communityChestDeck = [];
    
    const chanceCards = [
        { id: 'chance1', text: 'Advance to Boardwalk.', action: (player) => { moveTo(player, 39, false); }},
        { id: 'chance2', text: 'Advance to Go (Collect $200).', action: (player) => { moveTo(player, 0, true); }},
        { id: 'chance3', text: 'Advance to Illinois Avenue. If you pass Go, collect $200.', action: (player) => { moveTo(player, 24, true); }},
        { id: 'chance4', text: 'Advance to St. Charles Place. If you pass Go, collect $200.', action: (player) => { moveTo(player, 11, true); }},
        { id: 'chance5', text: 'Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental.', action: (player) => { advanceToNearest(player, 'Railroad'); }},
        { id: 'chance6', text: 'Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental.', action: (player) => { advanceToNearest(player, 'Railroad'); }},
        { id: 'chance7', text: 'Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times amount thrown.', action: (player) => { advanceToNearest(player, 'Utility'); }},
        { id: 'chance8', text: 'Bank pays you dividend of $50.', action: (player) => { player.money += 50; updatePlayerInfo(); }},
        { id: 'chance9', text: 'Get Out of Jail Free.', action: (player) => { player.getOutOfJailFreeCards++; updatePlayerInfo(); }},
        { id: 'chance10', text: 'Go Back 3 Spaces.', action: (player) => { player.position -= 3; updatePlayerPosition(player, player.position + 3); handleLanding(player); }},
        { id: 'chance11', text: 'Go to Jail. Go directly to Jail, do not pass Go, do not collect $200.', action: (player) => { goToJail(player); }},
        { id: 'chance12', text: 'Make general repairs on all your property. For each house pay $25. For each hotel pay $100.', action: (player) => { payForRepairs(player, 25, 100); }},
        { id: 'chance13', text: 'Speeding fine $15.', action: (player) => { player.money -= 15; updatePlayerInfo(); }},
        { id: 'chance14', text: 'Take a trip to Reading Railroad. If you pass Go, collect $200.', action: (player) => { moveTo(player, 5, true); }},
        { id: 'chance15', text: 'You have been elected Chairman of the Board. Pay each player $50.', action: (player) => { payEachPlayer(player, 50); }},
        { id: 'chance16', text: 'Your building loan matures. Collect $150.', action: (player) => { player.money += 150; updatePlayerInfo(); }},
    ];

    const communityChestCards = [
        { id: 'cc1', text: 'Advance to Go (Collect $200).', action: (player) => { moveTo(player, 0, true); }},
        { id: 'cc2', text: 'Bank error in your favor. Collect $200.', action: (player) => { player.money += 200; updatePlayerInfo(); }},
        { id: 'cc3', text: 'Doctor\'s fee. Pay $50.', action: (player) => { player.money -= 50; updatePlayerInfo(); }},
        { id: 'cc4', text: 'From sale of stock you get $50.', action: (player) => { player.money += 50; updatePlayerInfo(); }},
        { id: 'cc5', text: 'Get Out of Jail Free.', action: (player) => { player.getOutOfJailFreeCards++; updatePlayerInfo(); }},
        { id: 'cc6', text: 'Go to Jail. Go directly to jail, do not pass Go, do not collect $200.', action: (player) => { goToJail(player); }},
        { id: 'cc7', text: 'Holiday fund matures. Receive $100.', action: (player) => { player.money += 100; updatePlayerInfo(); }},
        { id: 'cc8', text: 'Income tax refund. Collect $20.', action: (player) => { player.money += 20; updatePlayerInfo(); }},
        { id: 'cc9', text: 'It is your birthday. Collect $10 from every player.', action: (player) => { collectFromEachPlayer(player, 10); }},
        { id: 'cc10', text: 'Life insurance matures. Collect $100.', action: (player) => { player.money += 100; updatePlayerInfo(); }},
        { id: 'cc11', text: 'Pay hospital fees of $100.', action: (player) => { player.money -= 100; updatePlayerInfo(); }},
        { id: 'cc12', text: 'Pay school fees of $50.', action: (player) => { player.money -= 50; updatePlayerInfo(); }},
        { id: 'cc13', text: 'Receive $25 consultancy fee.', action: (player) => { player.money += 25; updatePlayerInfo(); }},
        { id: 'cc14', text: 'You are assessed for street repair. $40 per house, $115 per hotel.', action: (player) => { payForRepairs(player, 40, 115); }},
        { id: 'cc15', text: 'You have won second prize in a beauty contest. Collect $10.', action: (player) => { player.money += 10; updatePlayerInfo(); }},
        { id: 'cc16', text: 'You inherit $100.', action: (player) => { player.money += 100; updatePlayerInfo(); }},
    ];

    function shuffleDecks() {
        chanceDeck = [...chanceCards].sort(() => Math.random() - 0.5);
        communityChestDeck = [...communityChestCards].sort(() => Math.random() - 0.5);
    }

    managePropertiesBtn.addEventListener('click', () => {
        openManagePropertiesModal(players[activePlayerIndex]);
    });
    
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    rollDiceBtn.addEventListener('click', () => {
        const player = players[activePlayerIndex];
        if (player.inJail) {
            handleJailTurn(player);
            return;
        }
        
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const total = die1 + die2;
        
        diceResultDiv.textContent = `You rolled a ${die1} and a ${die2}. Total: ${total}`;
        
        if (die1 === die2) {
            player.doublesCount++;
            diceResultDiv.textContent += ' - Doubles!';
            if (player.doublesCount === 3) {
                diceResultDiv.textContent += ' Go to Jail!';
                goToJail(player);
                endTurn();
                return;
            }
        } else {
            player.doublesCount = 0;
            rollDiceBtn.disabled = true;
            endTurnBtn.style.display = 'block';
        }

        movePlayer(player, total);
    });

    endTurnBtn.addEventListener('click', () => {
        endTurn();
    });

    function handleLanding(player) {
        const space = spaces[player.position];
        actionMenu.innerHTML = ''; 

        if (space.type === 'chest' || space.type === 'chance') {
            drawCard(player, space.type);
            return; 
        }

        if (space.price) { // It's a property, railroad, or utility
            if (space.owner === null) {
                const buyButton = document.createElement('button');
                buyButton.textContent = `Buy ${space.name} for $${space.price}`;
                buyButton.onclick = () => buyProperty(player, space);
                actionMenu.appendChild(buyButton);
                
                const passButton = document.createElement('button');
                passButton.textContent = 'Pass';
                passButton.onclick = () => {
                    actionMenu.innerHTML = '';
                };
                actionMenu.appendChild(passButton);

            } else if (space.owner !== player.id) {
                if (space.isMortgaged) {
                    diceResultDiv.textContent += ` - Landed on ${space.name}, which is mortgaged.`;
                    return;
                }
                const owner = players.find(p => p.id === space.owner);
                const rent = calculateRent(space, owner);
                const payRentButton = document.createElement('button');
                payRentButton.textContent = `Pay $${rent} rent to ${owner.name}`;
                payRentButton.onclick = () => payRent(player, owner, rent);
                actionMenu.appendChild(payRentButton);
            } else {
                endTurn();
            }
        } else if (space.name === 'Go to Jail') {
            goToJail(player);
        } else if (space.type === 'tax') {
            const tax = space.taxAmount;
            player.money -= tax;
            diceResultDiv.textContent += ` - Paid $${tax} in ${space.name}.`;
            updatePlayerInfo();
        } else {
            // Non-property space
            endTurn();
        }
    }

    function showGameAlert(message) {
        const alertModal = document.createElement('div');
        alertModal.classList.add('modal-overlay');
        alertModal.style.display = 'block';
        
        const alertContent = document.createElement('div');
        alertContent.classList.add('modal-content');
        alertContent.style.maxWidth = '400px';
        alertContent.style.textAlign = 'center';
        
        const alertText = document.createElement('p');
        alertText.textContent = message;
        alertText.style.margin = '20px 0';
        alertText.style.fontSize = '18px';
        
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.backgroundColor = 'var(--accent-color)';
        okButton.style.color = 'var(--background-color)';
        okButton.style.border = 'none';
        okButton.style.padding = '10px 40px';
        okButton.style.borderRadius = '8px';
        okButton.style.fontFamily = "'Poppins', sans-serif";
        okButton.style.fontSize = '16px';
        okButton.style.fontWeight = '600';
        okButton.style.cursor = 'pointer';
        okButton.style.transition = 'background-color 0.3s ease';
        
        okButton.onclick = () => {
            alertModal.remove();
        };
        
        alertContent.appendChild(alertText);
        alertContent.appendChild(okButton);
        alertModal.appendChild(alertContent);
        document.body.appendChild(alertModal);
    }

    function buyProperty(player, space) {
        if (player.money >= space.price) {
            player.money -= space.price;
            space.owner = player.id;
            updatePlayerInfo();
            updateOwnerDisplay(space);
        } else {
            showGameAlert("Not enough money to purchase this property!");
        }
        actionMenu.innerHTML = '';
    }

    function payRent(player, owner, rent) {
        player.money -= rent;
        owner.money += rent;
        updatePlayerInfo();
        actionMenu.innerHTML = '';
    }

    function calculateRent(space, owner) {
        if (space.type === 'railroad') {
            const ownedRailroads = spaces.filter(s => s.group === 'Railroad' && s.owner === owner.id).length;
            return space.rent[ownedRailroads - 1];
        }
        if (space.type === 'utility') {
            const ownedUtilities = spaces.filter(s => s.group === 'Utility' && s.owner === owner.id).length;
            const diceRoll = parseInt(diceResultDiv.textContent.split("Total: ")[1]);
            return (ownedUtilities === 1) ? diceRoll * 4 : diceRoll * 10;
        }

        // Property rent
        if (space.houses === 0) {
            const ownedInGroup = spaces.filter(s => s.group === space.group && s.owner === owner.id);
            const totalInGroup = spaces.filter(s => s.group === space.group).length;
            if (ownedInGroup.length === totalInGroup && ownedInGroup.every(p => !p.isMortgaged)) {
                return space.rent[0] * 2; // Monopoly rent (double base rent)
            }
            return space.rent[0];
        }
        return space.rent[space.houses];
    }

    function endTurn() {
        players[activePlayerIndex].doublesCount = 0;
        actionMenu.innerHTML = '';
        activePlayerIndex = (activePlayerIndex + 1) % players.length;
        updatePlayerInfo();
        diceResultDiv.textContent = `It's ${players[activePlayerIndex].name}'s turn.`;
        rollDiceBtn.disabled = false;
        endTurnBtn.style.display = 'none';
    }

    function createBoard() {
        for (let i = 0; i < 40; i++) {
            const spaceData = spaces[i];
            const spaceElement = document.createElement('div');
            spaceElement.classList.add('space');
            spaceElement.id = `space-${i}`;

            if (spaceData.color) {
                const colorBand = document.createElement('div');
                colorBand.style.backgroundColor = spaceData.color;
                colorBand.style.height = '20%';
                colorBand.style.width = '100%';
                spaceElement.appendChild(colorBand);
            }

            const nameElement = document.createElement('div');
            nameElement.classList.add('name');
            nameElement.textContent = spaceData.name;
            spaceElement.appendChild(nameElement);

            if (spaceData.price) {
                const ownerInfo = document.createElement('div');
                ownerInfo.classList.add('owner-info');
                spaceElement.appendChild(ownerInfo);

                const priceElement = document.createElement('div');
                priceElement.classList.add('price');
                priceElement.textContent = `$${spaceData.price}`;
                spaceElement.appendChild(priceElement);
            }

            const houseContainer = document.createElement('div');
            houseContainer.classList.add('house-container');
            spaceElement.insertBefore(houseContainer, nameElement);

            const playerPiecesContainer = document.createElement('div');
            playerPiecesContainer.classList.add('player-pieces-container');
            spaceElement.appendChild(playerPiecesContainer);
            
            // Position the spaces on the board
            const { row, col } = getPosition(i);
            spaceElement.style.gridRow = row;
            spaceElement.style.gridColumn = col;
            
            if (spaceData.type === 'corner') {
                spaceElement.classList.add('corner');
            }

            gameBoard.appendChild(spaceElement);
        }
        
        const centerArea = document.createElement('div');
        centerArea.id = 'center-area';
        const centerLogo = document.createElement('div');
        centerLogo.id = 'center-logo';
        centerLogo.textContent = 'MONOPOLY';
        centerArea.appendChild(centerLogo);
        gameBoard.appendChild(centerArea);
    }

    function movePlayer(player, steps) {
        const oldPosition = player.position;
        player.position = (oldPosition + steps) % 40;
        
        if (player.position < oldPosition) { // They passed Go
            player.money += 200;
            diceResultDiv.textContent += ' - Passed GO, collected $200!';
            updatePlayerInfo();
        }

        updatePlayerPosition(player, oldPosition);
        handleLanding(player);
    }

    function updatePlayerPosition(player, oldPosition) {
        // Remove from old spot
        const playerPieceOld = document.getElementById(`player-${player.id}`);
        if(playerPieceOld) {
            playerPieceOld.remove();
        }

        // Add to new spot
        const newSpaceElement = document.getElementById(`space-${player.position}`);
        const playerPiecesContainer = newSpaceElement.querySelector('.player-pieces-container');
        const playerPiece = document.createElement('div');
        playerPiece.classList.add('player-piece');
        playerPiece.style.backgroundColor = player.color;
        playerPiece.id = `player-${player.id}`;
        playerPiecesContainer.appendChild(playerPiece);
    }

    function updatePlayerInfo() {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-dark');
        playerInfoDiv.innerHTML = ''; // Clear existing info
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player-card');

            const ownedProperties = spaces.filter(space => space.owner === player.id);
            let propertiesHTML = ownedProperties.length > 0
                ? `<ul>${ownedProperties.map(p => `<li><span class="property-color-indicator" style="background-color:${p.color};"></span>${p.name} ${p.isMortgaged ? '(Mortgaged)' : ''}</li>`).join('')}</ul>`
                : '<p class="no-properties">No properties yet</p>';
            
            if (player.getOutOfJailFreeCards > 0) {
                propertiesHTML += `<p>Get Out of Jail Free cards: ${player.getOutOfJailFreeCards}</p>`;
            }

            playerDiv.innerHTML = `
                <div class="player-details">
                    <h3>${player.name}</h3>
                    <p>Money: $${player.money}</p>
                </div>
                <div class="player-properties">
                    <strong>Properties:</strong>
                    ${propertiesHTML}
                </div>
            `;
            if (player === players[activePlayerIndex]) {
                playerDiv.style.backgroundColor = accentColor;
                playerDiv.style.border = 'none';
            }
            playerInfoDiv.appendChild(playerDiv);
        });
    }

    function drawPlayers() {
        players.forEach(player => {
            const playerPiece = document.createElement('div');
            playerPiece.classList.add('player-piece');
            playerPiece.style.backgroundColor = player.color;
            playerPiece.id = `player-${player.id}`;

            const spaceElement = document.getElementById(`space-${player.position}`);
            const playerPiecesContainer = spaceElement.querySelector('.player-pieces-container');
            playerPiecesContainer.appendChild(playerPiece);
        });
    }

    function getPosition(index) {
        if (index >= 0 && index <= 10) { // Bottom Row
            return { row: 11, col: 11 - index };
        }
        if (index > 10 && index <= 20) { // Left Col
            return { row: 11 - (index - 10), col: 1 };
        }
        if (index > 20 && index <= 30) { // Top Row
            return { row: 1, col: index - 19 };
        }
        if (index > 30 && index < 40) { // Right Col
            return { row: index - 29, col: 11 };
        }
    }

    function openManagePropertiesModal(player) {
        modalPropertiesList.innerHTML = '';
        const ownedProperties = spaces.filter(s => s.owner === player.id);
    
        if (ownedProperties.length === 0) {
            modalPropertiesList.innerHTML = '<p>You do not own any properties to manage.</p>';
        } else {
            // Properties that can have houses
            const houseProperties = ownedProperties.filter(p => p.houseCost);
            const groupedProperties = houseProperties.reduce((acc, p) => {
                acc[p.group] = acc[p.group] || [];
                acc[p.group].push(p);
                return acc;
            }, {});

            for (const group in groupedProperties) {
                const propertiesInGroup = groupedProperties[group];
                const totalInGroup = spaces.filter(s => s.group === group).length;
                const hasMonopoly = propertiesInGroup.length === totalInGroup;

                propertiesInGroup.forEach(space => {
                    const propertyItem = createPropertyModalItem(player, space, hasMonopoly, propertiesInGroup);
                    modalPropertiesList.appendChild(propertyItem);
                });
            }

            // Railroads and Utilities
            const otherProperties = ownedProperties.filter(p => !p.houseCost);
            otherProperties.forEach(space => {
                const propertyItem = createPropertyModalItem(player, space, false, []);
                modalPropertiesList.appendChild(propertyItem);
            });
        }
    
        modal.style.display = 'block';
    }
    
    function createPropertyModalItem(player, space, hasMonopoly, propertiesInGroup) {
        const propertyItem = document.createElement('div');
        propertyItem.classList.add('modal-property-item');

        const text = document.createElement('span');
        text.classList.add('modal-property-item-name');
        text.textContent = `${space.name} ${space.isMortgaged ? '(Mortgaged)' : ''}`;
        
        const buttonContainer = document.createElement('div');

        // Mortgage Button
        if (space.houses === 0) {
            const mortgageButton = document.createElement('button');
            if (space.isMortgaged) {
                const unmortgageCost = Math.floor(space.price * 0.5 * 1.1);
                mortgageButton.textContent = `Unmortgage for $${unmortgageCost}`;
                mortgageButton.classList.add('unmortgage');
                mortgageButton.onclick = () => unmortgageProperty(player, space, unmortgageCost);
            } else {
                const mortgageValue = space.price / 2;
                mortgageButton.textContent = `Mortgage for $${mortgageValue}`;
                mortgageButton.onclick = () => mortgageProperty(player, space, mortgageValue);
            }
            buttonContainer.appendChild(mortgageButton);
        }

        // House/Hotel Buttons
        if (hasMonopoly && !space.isMortgaged) {
            const canBuild = canBuildHouse(player, space, propertiesInGroup);
            if (space.houses < 5 && canBuild) {
                    const buyHouseButton = document.createElement('button');
                buyHouseButton.textContent = `Buy ${space.houses < 4 ? 'House' : 'Hotel'} ($${space.houseCost})`;
                buyHouseButton.onclick = () => buyHouse(player, space, propertiesInGroup);
                buttonContainer.appendChild(buyHouseButton);
            }
            if (space.houses > 0) {
                const sellHouseButton = document.createElement('button');
                sellHouseButton.textContent = `Sell ${space.houses < 5 ? 'House' : 'Hotel'} ($${space.houseCost / 2})`;
                sellHouseButton.onclick = () => sellHouse(player, space, propertiesInGroup);
                buttonContainer.appendChild(sellHouseButton);
            }
        }

        propertyItem.appendChild(text);
        propertyItem.appendChild(buttonContainer);
        return propertyItem;
    }
    
    function mortgageProperty(player, space, mortgageValue) {
        player.money += mortgageValue;
        space.isMortgaged = true;
    
        updateOwnerDisplay(space);
        updatePlayerInfo();
        openManagePropertiesModal(player);
    }
    
    function unmortgageProperty(player, space, unmortgageCost) {
        if (player.money >= unmortgageCost) {
            player.money -= unmortgageCost;
            space.isMortgaged = false;
            updateOwnerDisplay(space);
            updatePlayerInfo();
            openManagePropertiesModal(player);
        } else {
            showGameAlert('You do not have enough money to unmortgage this property.');
        }
    }

    function canBuildHouse(player, space, group) {
        // "Even build" rule
        let canBuild = true;
        group.forEach(p => {
            if (p.houses < space.houses) {
                canBuild = false;
            }
        });
        return canBuild;
    }

    function buyHouse(player, space, group) {
        if (player.money >= space.houseCost) {
            player.money -= space.houseCost;
            space.houses++;
            updatePlayerInfo();
            openManagePropertiesModal(player);
            drawHousesOnBoard();
        } else {
            showGameAlert('Not enough money to build a house.');
        }
    }

    function sellHouse(player, space, group) {
        let canSell = true;
        group.forEach(p => {
            if (p.houses > space.houses) {
                canSell = false;
            }
        });

        if (!canSell) {
            showGameAlert('You must sell houses evenly. Sell from a property with more houses first.');
            return;
        }

        player.money += space.houseCost / 2;
        space.houses--;
        updatePlayerInfo();
        openManagePropertiesModal(player);
        drawHousesOnBoard();
    }

    function drawHousesOnBoard() {
        spaces.forEach((space, index) => {
            if (space.houses !== undefined) {
                const spaceElement = document.getElementById(`space-${index}`);
                const houseContainer = spaceElement.querySelector('.house-container');
                houseContainer.innerHTML = ''; 

                if (space.houses > 0) {
                    if (space.houses === 5) {
                        const hotel = document.createElement('div');
                        hotel.classList.add('hotel');
                        houseContainer.appendChild(hotel);
                    } else {
                        for (let i = 0; i < space.houses; i++) {
                            const house = document.createElement('div');
                            house.classList.add('house');
                            houseContainer.appendChild(house);
                        }
                    }
                }
            }
        });
    }

    function drawCard(player, deckType) {
        let card;
        let deckName;
        if (deckType === 'chance') {
            card = chanceDeck.shift();
            chanceDeck.push(card);
            deckName = 'Chance';
        } else {
            card = communityChestDeck.shift();
            communityChestDeck.push(card);
            deckName = 'Community Chest';
        }

        cardModalTitle.textContent = deckName;
        cardModalText.textContent = card.text;
        cardModal.style.display = 'block';

        cardModalOkBtn.onclick = () => {
            cardModal.style.display = 'none';
            card.action(player);
        };
    }
    
    function moveTo(player, spaceIndex, collectGo) {
        const oldPosition = player.position;
        player.position = spaceIndex;
        
        if (collectGo && player.position < oldPosition) {
            player.money += 200;
        }

        updatePlayerPosition(player, oldPosition);
        handleLanding(player);
    }
    
    function advanceToNearest(player, type) {
        const positions = spaces.map((s, i) => s.type === type ? i : -1).filter(i => i !== -1);
        let nearest = -1;
        let minDistance = 40;
    
        positions.forEach(pos => {
            let distance = pos - player.position;
            if (distance < 0) distance += 40;
            if (distance < minDistance) {
                minDistance = distance;
                nearest = pos;
            }
        });
    
        const oldPosition = player.position;
        player.position = nearest;
        
        if (nearest < oldPosition) { // They passed Go
            player.money += 200;
            diceResultDiv.textContent += ' - Passed GO, collected $200!';
            updatePlayerInfo();
        }

        updatePlayerPosition(player, oldPosition);
        
        const space = spaces[nearest];
        if (space.owner === null) {
            // Show buy option
            const buyButton = document.createElement('button');
            buyButton.textContent = `Buy ${space.name} for $${space.price}`;
            buyButton.onclick = () => buyProperty(player, space);
            actionMenu.appendChild(buyButton);
            
            const passButton = document.createElement('button');
            passButton.textContent = 'Pass';
            passButton.onclick = () => {
                actionMenu.innerHTML = '';
                endTurn();
            };
            actionMenu.appendChild(passButton);
        } else if (space.owner !== player.id) {
            if (space.isMortgaged) {
                diceResultDiv.textContent += ` - Landed on ${space.name}, which is mortgaged.`;
                endTurn();
                return;
            }
            let rent;
            if (type === 'Railroad') {
                const ownedRailroads = spaces.filter(s => s.group === 'Railroad' && s.owner === space.owner).length;
                rent = space.rent[ownedRailroads - 1] * 2;
            } else { // Utility
                const die1 = Math.floor(Math.random() * 6) + 1;
                const die2 = Math.floor(Math.random() * 6) + 1;
                rent = (die1 + die2) * 10;
                diceResultDiv.textContent += ` - Rolled ${die1}+${die2} for utility, paying $${rent}.`;
            }
            const owner = players.find(p => p.id === space.owner);
            player.money -= rent;
            owner.money += rent;
            updatePlayerInfo();
            endTurn();
        } else {
            endTurn();
        }
    }
    
    function payForRepairs(player, houseCost, hotelCost) {
        let totalCost = 0;
        spaces.filter(s => s.owner === player.id).forEach(s => {
            if (s.houses === 5) {
                totalCost += hotelCost;
            } else {
                totalCost += s.houses * houseCost;
            }
        });
        player.money -= totalCost;
        updatePlayerInfo();
    }
    
    function payEachPlayer(player, amount) {
        players.forEach(p => {
            if (p.id !== player.id) {
                player.money -= amount;
                p.money += amount;
            }
        });
        updatePlayerInfo();
    }
    
    function collectFromEachPlayer(player, amount) {
        players.forEach(p => {
            if (p.id !== player.id) {
                p.money -= amount;
                player.money += amount;
            }
        });
        updatePlayerInfo();
    }
    
    function goToJail(player) {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        updatePlayerPosition(player, -1); // -1 signifies we don't know old position / don't remove from board
        updatePlayerInfo();
    }

    function handleJailTurn(player) {
        actionMenu.innerHTML = '';
        player.jailTurns++;

        const payButton = document.createElement('button');
        payButton.textContent = 'Pay $50 to get out';
        payButton.onclick = () => {
            player.money -= 50;
            player.inJail = false;
            actionMenu.innerHTML = '';
            rollDiceBtn.disabled = false;
            updatePlayerInfo();
        };
        actionMenu.appendChild(payButton);

        if (player.getOutOfJailFreeCards > 0) {
            const useCardButton = document.createElement('button');
            useCardButton.textContent = 'Use Get Out of Jail Free Card';
            useCardButton.onclick = () => {
                player.getOutOfJailFreeCards--;
                player.inJail = false;
                actionMenu.innerHTML = '';
                rollDiceBtn.disabled = false;
                updatePlayerInfo();
            };
            actionMenu.appendChild(useCardButton);
        }

        const rollForDoublesButton = document.createElement('button');
        rollForDoublesButton.textContent = 'Roll for doubles';
        rollForDoublesButton.onclick = () => {
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            diceResultDiv.textContent = `You rolled a ${die1} and a ${die2}.`;
            if (die1 === die2) {
                player.inJail = false;
                actionMenu.innerHTML = '';
                rollDiceBtn.disabled = true; // They rolled, so now they move
                endTurnBtn.style.display = 'block';
                movePlayer(player, die1 + die2);
            } else {
                if (player.jailTurns >= 3) {
                    diceResultDiv.textContent += ' - You must pay the fine now.';
                    player.money -= 50;
                    player.inJail = false;
                }
                endTurn();
            }
        };
        actionMenu.appendChild(rollForDoublesButton);
    }

    function updateOwnerDisplay(space) {
        const spaceIndex = spaces.indexOf(space);
        if (spaceIndex === -1) return;
    
        const spaceElement = document.getElementById(`space-${spaceIndex}`);
        const ownerInfo = spaceElement.querySelector('.owner-info');
    
        if (ownerInfo) {
            if (space.owner !== null) {
                const owner = players.find(p => p.id === space.owner);
                let ownerText = `Owned by ${owner.name}`;
                if (space.isMortgaged) {
                    ownerText += ' (Mortgaged)';
                }
                ownerInfo.textContent = ownerText;
            } else {
                ownerInfo.textContent = '';
            }
        }
    }

    managePropertiesBtn.disabled = false;
    proposeTradeBtn.disabled = false;
    shuffleDecks();
    createBoard();
    drawPlayers();
    updatePlayerInfo();
    setupTradeModalListeners();
    diceResultDiv.textContent = `It's ${players[activePlayerIndex].name}'s turn.`;

    function setupTradeModalListeners() {
        const closeModalBtns = document.querySelectorAll('#trade-modal .close-modal, #view-trade-modal .close-modal');
        closeModalBtns.forEach(btn => {
            btn.onclick = () => {
                tradeModal.style.display = 'none';
                viewTradeModal.style.display = 'none';
            }
        });

        proposeTradeBtn.addEventListener('click', () => {
            const player = players[activePlayerIndex];
            openTradeModal(player);
        });

        document.getElementById('trade-partner-select').addEventListener('change', (e) => {
            const partnerId = parseInt(e.target.value);
            if (isNaN(partnerId)) return;
            const partner = players.find(p => p.id === partnerId);
            populateTradePanel(players[activePlayerIndex], 'current-player', partner);
            populateTradePanel(partner, 'trade-partner', players[activePlayerIndex]);
        });

        document.getElementById('execute-trade-btn').addEventListener('click', proposeTrade);
        document.getElementById('accept-trade-btn').addEventListener('click', executeTrade);
        document.getElementById('reject-trade-btn').addEventListener('click', () => {
            viewTradeModal.style.display = 'none';
            currentTrade = {};
        });
    }

    function openTradeModal(player) {
        const tradePartnerSelect = document.getElementById('trade-partner-select');
        tradePartnerSelect.innerHTML = '<option>Select a player</option>';
        players.forEach(p => {
            if (p.id !== player.id) {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = p.name;
                tradePartnerSelect.appendChild(option);
            }
        });
        document.getElementById('current-player-offer').innerHTML = `<h3>Your Offer</h3>`;
        document.getElementById('trade-partner-offer').innerHTML = `<h3>Their Offer</h3>`;
        tradeModal.style.display = 'block';
    }

    function populateTradePanel(player, panelPrefix, otherPlayer) {
        const panel = document.getElementById(`${panelPrefix}-offer`);
        panel.innerHTML = `<h3>${player.name}'s Offer</h3>`;

        const assetsDiv = document.createElement('div');
        assetsDiv.classList.add('trade-assets');
        
        assetsDiv.innerHTML += `<label>Money:</label><input type="number" id="${panelPrefix}-money" min="0" max="${player.money}" value="0">`;
        
        const propertiesDiv = document.createElement('div');
        propertiesDiv.id = `${panelPrefix}-properties`;
        propertiesDiv.classList.add('trade-properties-list');
        spaces.filter(s => s.owner === player.id && s.houses === 0).forEach((p, i) => {
            propertiesDiv.innerHTML += `<label><input type="checkbox" data-property-index="${spaces.indexOf(p)}"> ${p.name}</label>`;
        });
        assetsDiv.appendChild(propertiesDiv);

        const jailCardsDiv = document.createElement('div');
        jailCardsDiv.id = `${panelPrefix}-jail-cards`;
        jailCardsDiv.classList.add('trade-jail-cards-list');
        if (player.getOutOfJailFreeCards > 0) {
            jailCardsDiv.innerHTML += `<label><input type="checkbox" id="${panelPrefix}-jail-card"> Get Out of Jail Free Card</label>`;
        }
        assetsDiv.appendChild(jailCardsDiv);
        panel.appendChild(assetsDiv);
    }

    function proposeTrade() {
        const partnerId = parseInt(document.getElementById('trade-partner-select').value);
        if (isNaN(partnerId)) {
            showGameAlert('Please select a player to trade with.');
            return;
        }

        const offeringPlayer = players[activePlayerIndex];
        const receivingPlayer = players.find(p => p.id === partnerId);

        const offer = {
            money: parseInt(document.getElementById('current-player-money').value) || 0,
            properties: Array.from(document.querySelectorAll('#current-player-properties input:checked')).map(cb => parseInt(cb.dataset.propertyIndex)),
            jailCards: document.getElementById('current-player-jail-card')?.checked ? 1 : 0
        };

        const request = {
            money: parseInt(document.getElementById('trade-partner-money').value) || 0,
            properties: Array.from(document.querySelectorAll('#trade-partner-properties input:checked')).map(cb => parseInt(cb.dataset.propertyIndex)),
            jailCards: document.getElementById('trade-partner-jail-card')?.checked ? 1 : 0
        };

        // Validate that both players are offering something
        const offeringPlayerHasOffer = offer.properties.length > 0 || offer.jailCards > 0 || offer.money > 0;
        const receivingPlayerHasOffer = request.properties.length > 0 || request.jailCards > 0 || request.money > 0;

        if (!offeringPlayerHasOffer || !receivingPlayerHasOffer) {
            showGameAlert('Both players must offer something in the trade (money, properties, or Get Out of Jail Free cards).');
            return;
        }

        // Validate that the trade includes either properties or jail cards
        if (offer.properties.length === 0 && offer.jailCards === 0 && request.properties.length === 0 && request.jailCards === 0) {
            showGameAlert('Trades must include either properties or Get Out of Jail Free cards. Money-only trades are not allowed.');
            return;
        }

        if(offer.money > offeringPlayer.money || request.money > receivingPlayer.money) {
            showGameAlert('Cannot offer more money than a player has.');
            return;
        }

        currentTrade = { offeringPlayer, receivingPlayer, offer, request };
        
        tradeModal.style.display = 'none';
        showTradeProposal();
    }

    function showTradeProposal() {
        const { offeringPlayer, receivingPlayer, offer, request } = currentTrade;
        document.getElementById('proposing-player-name').textContent = offeringPlayer.name;

        const givesDiv = document.getElementById('view-trade-gives');
        givesDiv.innerHTML = formatTradeItems(request);

        const receivesDiv = document.getElementById('view-trade-receives');
        receivesDiv.innerHTML = formatTradeItems(offer);
        
        viewTradeModal.style.display = 'block';
    }

    function formatTradeItems(items) {
        let html = '<ul>';
        if (items.money > 0) html += `<li>$${items.money}</li>`;
        items.properties.forEach(pIndex => {
            html += `<li>${spaces[pIndex].name}</li>`;
        });
        if (items.jailCards > 0) html += `<li>Get Out of Jail Free Card</li>`;
        if (html === '<ul>') return '<p>Nothing</p>';
        return html + '</ul>';
    }

    function executeTrade() {
        const { offeringPlayer, receivingPlayer, offer, request } = currentTrade;

        // Exchange money
        offeringPlayer.money = offeringPlayer.money - offer.money + request.money;
        receivingPlayer.money = receivingPlayer.money - request.money + offer.money;

        // Exchange properties
        offer.properties.forEach(pIndex => {
            spaces[pIndex].owner = receivingPlayer.id;
            updateOwnerDisplay(spaces[pIndex]);
        });
        request.properties.forEach(pIndex => {
            spaces[pIndex].owner = offeringPlayer.id;
            updateOwnerDisplay(spaces[pIndex]);
        });

        // Exchange jail cards
        offeringPlayer.getOutOfJailFreeCards = offeringPlayer.getOutOfJailFreeCards - offer.jailCards + request.jailCards;
        receivingPlayer.getOutOfJailFreeCards = receivingPlayer.getOutOfJailFreeCards - request.jailCards + offer.jailCards;

        updatePlayerInfo();
        viewTradeModal.style.display = 'none';
        currentTrade = {};
    }
}); 