window.onload = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setup();
    menu();
};

const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

let state = {
    mode: null,
    activePlayer: null,
    activeCard: null
}

let setMode = (mode) => {
    state.mode = mode;
    document.getElementsByClassName("menu")[0].style.display = "none";
    console.log(state.mode);
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
                    card.html.style.opacity = "0.5";
                    state.activeCard = card;
                }
                else if (card.active && state.activeCard.value == card.value) {
                    state.activeCard = null;
                    card.active = false;
                    card.html.style.opacity = "1";
                }
                else {
                    card.active = false;
                    card.html.style.opacity = "1";
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
            this.compareValues(tile);
            tile.html.style.backgroundColor = tile.ownedBy.color;
            tile.html.appendChild(document.createTextNode(tile.cardValue));
            tile.active = false;
            state.activeCard.used = true;
            state.activeCard.html.style.opacity = "0.3";
            state.activeCard = null;
            if (state.activePlayer == this.players[0]) {
                state.activePlayer = this.players[1];
                this.players[0].deck.cards[0].html.parentElement.style.opacity = "0.5";
                this.players[1].deck.cards[0].html.parentElement.style.opacity = "1";
            } else {
                state.activePlayer = this.players[0];
                this.players[1].deck.cards[0].html.parentElement.style.opacity = "0.5";
                this.players[0].deck.cards[0].html.parentElement.style.opacity = "1";
            }
        }
        this.gameOver();

        let allCards = (this.players.map(player => { return player.deck.cards })).flat();
        if ((allCards.map(card => { return card.used })).every(c => c == true)) {
            this.gameOver();
        }
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

        neighborIDs[tileID].map(id => {
            if (tile.cardValue > this.tiles[id].cardValue && this.tiles[id].cardValue !== null) {
                this.tiles[id].ownedBy = state.activePlayer;
                this.tiles[id].html.style.backgroundColor = this.tiles[id].ownedBy.color;
            }

        });
    }

    gameOver() {
        let results = ((this.tiles.map(tile => { return tile.ownedBy })).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()));
        results.delete(null);
        results.forEach((value, key) => {
            key.score = value;
        });

        if (this.players[0].score > this.players[1].score) {
            console.log("player 1 won");
        }
        else if (this.players[1].score > this.players[0].score) {
            console.log("player 2 won");
        }
        else {
            console.log("it's a tie");
        }
    }
}

let setup = () => {
    let players = [];
    let random = Math.round(Math.random());
    if (random == 1) {
        players = [
            new Player(new Deck(1, 19), "red"),
            new Player(new Deck(2, 19), "blue")
        ]
        state.activePlayer = players[0];
    }
    else {
        players = [
            new Player(new Deck(2, 19), "blue"),
            new Player(new Deck(1, 19), "red")
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
        players[1].deck.cards[0].html.parentElement.style.opacity = "0.5";
    }
    else {
        players[0].deck.cards[0].html.parentElement.style.opacity = "0.5";
    }
    return new Board(players);
};

let menu = () => {

};