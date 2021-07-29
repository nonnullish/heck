window.onload = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    state.board = setup();
};

const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

let state = {
    board: null,
    mode: null,
    activePlayer: null,
    activeCard: null
}

let newGame = () => {
    document.getElementById("game-over").style.display = "none";
    document.getElementById("canvas").innerHTML = "";
    document.getElementsByClassName("deck")[0].innerHTML = "";
    document.getElementsByClassName("deck")[1].innerHTML = "";

    state = {
        board: null,
        mode: null,
        activePlayer: null,
        activeCard: null
    }

    state.board = setup();
    document.getElementById("menu").style.display = "flex";
}

let setMode = (mode) => {
    state.mode = mode;
    var tl = anime.timeline({
        easing: 'easeOutCubic',
        duration: 200
    });
    tl.add({
        targets: document.getElementById("menu"),
        opacity: 0,
    });
    tl.add({
        targets: document.getElementsByClassName("game")[0],
        opacity: 1,
    });
    setTimeout(function () {
        document.getElementById("menu").style.display = "none";
    }, 200);
    if (mode == "computer") {
        setTimeout(function () {
            let bee = document.getElementsByClassName('bee')[0];
            let beeContainer = document.getElementById('bee-player');
            beeContainer.appendChild(bee);
            beeContainer.style.position = "absolute";
        }, 200);
    }
    if (state.activePlayer == state.board.players[0] && state.mode == "computer") {
        state.board.computerMove();
    }
}

let Player = class {
    constructor(deck, color) {
        this.deck = deck;
        this.color = color;
        this.score = null;
    }
};

let Card = class {
    constructor(value) {
        this.value = value;
        this.active = false;
        this.used = false;
        this.html = null;
    }
};

let Deck = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cards = this.createCards();
        this.createHTMLDeck();
    }

    createCards() {
        const min = Math.min(this.x, this.y), max = Math.max(this.x, this.y);
        return range(min, max, 2).map(value => new Card(value));
    }

    createHTMLDeck() {
        let HTMLdeck = [];
        for (let i in this.cards) {
            let hexagon = document.createElement("div");
            hexagon.className = "hexagon";
            hexagon.appendChild(document.createTextNode(this.cards[i].value));
            hexagon.onclick = () => { if (!this.cards[i].used) { this.selectCardFromDeck(this.cards[i]) } };
            this.cards[i].html = hexagon;
            HTMLdeck.push(hexagon);
        }
        return HTMLdeck;
    }

    selectCardFromDeck(card) {
        if (state.activePlayer.deck.cards.includes(card)) {
            if (!state.activeCard || state.activeCard.value == card.value) {
                if (!card.active && !card.used) {
                    card.active = true;
                    var tl = anime.timeline({
                        easing: 'easeOutCubic',
                        duration: 200
                    });
                    tl.add({
                        targets: card.html,
                        scale: 1.3,
                    });
                    tl.add({
                        targets: card.html,
                        scale: 1,
                    });
                    tl.add({
                        targets: card.html,
                        opacity: 0.5
                    })
                    state.activeCard = card;
                }
                else if (card.active && state.activeCard.value == card.value) {
                    state.activeCard = null;
                    card.active = false;
                    anime({
                        targets: card.html,
                        opacity: 1,
                        easing: 'easeOutCubic',
                        duration: 300
                    });
                }
                else {
                    card.active = false;
                    anime({
                        targets: card.html,
                        opacity: 1,
                        easing: 'easeOutCubic',
                        duration: 300
                    });
                }
            }
        }
    }
}

let Tile = class {
    constructor() {
        this.cardValue = null;
        this.active = true;
        this.ownedBy = null;
        this.html = null;
    }
}

let Board = class {
    constructor(players) {
        this.tiles = this.createTiles();
        this.players = players;
        this.createHTMLTiles();
    }

    createTiles() {
        return range(0, 19).map(tile => new Tile());
    }

    createHTMLTiles() {
        let HTMLTiles = [];
        let index = 0;
        let canvas = document.getElementById("canvas");
        for (let i = 0; i < 23; i++) {
            let hexagon = document.createElement("div");
            hexagon.className = "hexagon";
            // this is to make the board hexagonal 
            if (![0, 4, 11, 18, 22].includes(i)) {
                hexagon.id = `hex-${index}`;
                let tile = this.tiles[index];
                hexagon.onclick = () => this.placeCardOnTile(tile);
                tile.html = hexagon;
                index++;
            }
            else {
                hexagon.id = "hidden";
            }
            HTMLTiles.push(hexagon);
            canvas.appendChild(hexagon);
        }
        return HTMLTiles;
    }

    placeCardOnTile(tile) {
        if (state.activeCard != null && tile.active == true) {
            tile.cardValue = state.activeCard.value;
            tile.ownedBy = state.activePlayer;
            let claimedTiles = this.compareValues(tile);
            tile.html.style.backgroundColor = tile.ownedBy.color;
            tile.html.appendChild(document.createTextNode(tile.cardValue));

            var tl = anime.timeline({
                easing: 'easeOutCubic',
                duration: 350
            });
            tl.add({
                targets: [tile.html, claimedTiles].flat(),
                scale: 1.3,
            });
            tl.add({
                targets: [tile.html, claimedTiles].flat(),
                scale: 1,
            });

            tile.active = false;
            state.activeCard.used = true;
            anime({
                targets: state.activeCard,
                opacity: 0.3,
                easing: 'easeOutCubic',
                duration: 300
            });
            state.activeCard = null;
            if (state.activePlayer == this.players[0]) {
                state.activePlayer = this.players[1];
                anime({
                    targets: this.players[0].deck.cards[0].html.parentElement,
                    opacity: 0.5,
                    easing: 'easeOutCubic',
                    duration: 300
                });
                anime({
                    targets: this.players[1].deck.cards[0].html.parentElement,
                    opacity: 1,
                    easing: 'easeOutCubic',
                    duration: 300
                });
            } else {
                state.activePlayer = this.players[0];
                anime({
                    targets: this.players[1].deck.cards[0].html.parentElement,
                    opacity: 0.5,
                    easing: 'easeOutCubic',
                    duration: 300
                });
                anime({
                    targets: this.players[0].deck.cards[0].html.parentElement,
                    opacity: 1,
                    easing: 'easeOutCubic',
                    duration: 300
                });
            }
        }

        let allCards = (this.players.map(player => { return player.deck.cards })).flat();
        let allCardsUsed = (allCards.map(card => { return card.used })).every(c => c == true);
        if (!allCardsUsed && state.mode == "computer" && state.activePlayer == this.players[0]) {
            this.computerMove();
        }

        if (allCardsUsed) {
            this.gameOver();
        }
    }

    computerMove() {
        isSpinning = false;
        isThinking = true;
        setTimeout(() => {
            let availableCards = state.activePlayer.deck.cards.filter(card => { if (!card.used) { return card } });
            let availableTiles = this.tiles.filter(tile => { if (tile !== undefined && tile.html !== null && tile.active) { return tile } });
            let randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            let randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
            state.activeCard = randomCard;
            this.placeCardOnTile(randomTile);
            isThinking = false;
            isSpinning = true;
        }, 750);
    }

    compareValues(tile) {
        let tileID = parseInt(tile.html.id.match(/\d+/)[0]);
        const neighborIDs = [
            [1, 3, 4],
            [0, 2, 4, 5],
            [1, 5, 6],
            [0, 4, 7, 8],
            [0, 1, 3, 5, 8],
            [1, 2, 4, 6, 9],
            [2, 5, 9, 10],
            [3, 8, 11],
            [3, 4, 7, 11, 12],
            [5, 6, 10, 13, 14],
            [6, 9, 14],
            [7, 8, 12, 15],
            [8, 11, 13, 15, 16],
            [9, 12, 14, 16, 17],
            [9, 10, 13, 17],
            [11, 12, 16],
            [12, 13, 15, 17],
            [13, 14, 16]
        ]

        let gettingOwned = neighborIDs[tileID].filter(id =>
            tile.cardValue > this.tiles[id].cardValue
            && this.tiles[id].cardValue !== null
            && this.tiles[id].ownedBy !== state.activePlayer);

        let gettingOwnedHTML = gettingOwned.map(index => this.tiles[index].html);

        neighborIDs[tileID].map(id => {
            if (tile.cardValue > this.tiles[id].cardValue && this.tiles[id].cardValue !== null) {
                this.tiles[id].ownedBy = state.activePlayer;
                this.tiles[id].html.style.backgroundColor = this.tiles[id].ownedBy.color;
            }
        });

        return gettingOwnedHTML;
    }

    gameOver() {
        let results = ((this.tiles.map(tile => { return tile.ownedBy })).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()));
        results.delete(null);
        results.forEach((value, key) => {
            key.score = value;
        });
        document.getElementById("game-over").style.display = "flex";

        if (this.players[0].score > this.players[1].score) {
            document.getElementById('winner').innerHTML = "Player 1 won!"
        }
        else if (this.players[1].score > this.players[0].score) {
            document.getElementById('winner').innerHTML = "Player 2 won!"
        }
        else {
            document.getElementById('winner').innerHTML = "It's a tie!"
        }
    }
}

let setup = () => {
    let players = [];
    let random = Math.round(Math.random());
    if (random == 1) {
        players = [
            new Player(new Deck(1, 19), "#B9DBD7"),
            new Player(new Deck(2, 19), "#ffacac")
        ]
        state.activePlayer = players[0];
    }
    else {
        players = [
            new Player(new Deck(2, 19), "#ffacac"),
            new Player(new Deck(1, 19), "#B9DBD7")
        ];
        state.activePlayer = players[1];
    }

    let HTMLdecks = document.getElementsByClassName("deck");
    for (let i in players) {
        let HTMLdeck = HTMLdecks[i];
        let playerDeck = players[i].deck.createHTMLDeck();
        for (let j in playerDeck) {
            playerDeck[j].style.backgroundColor = players[i].color;
            HTMLdeck.appendChild(playerDeck[j]);
        }
    }
    if (random == 1) {
        anime({
            targets: players[1].deck.cards[0].html.parentElement,
            opacity: 0.5,
            easing: 'easeOutCubic',
            duration: 300
        });
    }
    else {
        anime({
            targets: players[0].deck.cards[1].html.parentElement,
            opacity: 0.5,
            easing: 'easeOutCubic',
            duration: 300
        });
    }
    return new Board(players);
};