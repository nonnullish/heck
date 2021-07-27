window.onload = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setup();
};

const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

let state = {
    activePlayer: null,
    activeCard: null
}

let Player = class {
    constructor(deck) {
        this.deck = deck;
        this.active = false;
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

let Tile = class {
    constructor() {
        this.cardValue = null;
        this.active = true;
        this.ownedBy = null;
        this.html = null;
    }
}

let Board = class {
    constructor() {
        this.tiles = this.createTiles();
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
        if (state.activeCard != null) {
            tile.cardValue = state.activeCard.value;
            tile.html.appendChild(document.createTextNode(tile.cardValue));
            state.activeCard.used = true;
            state.activeCard.html.style.opacity = "0.3";
            state.activeCard = null;
        }
    }
}

let setup = () => {
    let players = [
        new Player(new Deck(1, 19)),
        new Player(new Deck(2, 19))
    ];

    if (Math.round(Math.random()) == 1) {
        [players[0], players[1]] = [players[1], players[0]];
    }

    let HTMLdecks = document.getElementsByClassName("deck");
    for (let i in players) {
        let HTMLdeck = HTMLdecks[i];
        let playerDeck = players[i].deck.createHTMLDeck();
        for (let j in playerDeck) {
            HTMLdeck.appendChild(playerDeck[j])
        }
    }
    new Board();
};