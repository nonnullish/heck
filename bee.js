let isSpinning = true;
let isThinking = false;

let bee = new Zdog.Illustration({
    element: '.bee',
    dragRotate: true,
    rotate: { y: -Zdog.TAU / 8, x: -Zdog.TAU / 16 },
    onDragStart: function () {
        isSpinning = false;
    },
    onDragEnd: function () {
        isSpinning = true;
    },
});

let wing = new Zdog.Ellipse({
    addTo: bee,
    width: 40,
    height: 80,
    stroke: 8,
    translate: { z: 40, y: -40 },
    fill: true,
    color: 'white',
    rotate: { y: 45, z: 45 }
});

wing.copy({
    translate: { z: -40, y: -40 },
    rotate: { y: -45, z: 45 }
})

let eye = new Zdog.Shape({
    addTo: bee,
    translate: { x: -35, y: -10, z: 10 },
    stroke: 5,
    color: '#222',
});

eye.copy({
    translate: { x: -35, y: -10, z: -10 },
})

let mouth = new Zdog.Ellipse({
    addTo: bee,
    diameter: 20,
    quarters: 2, // semi-circle
    translate: { x: -35, y: 0 },
    rotate: { y: Zdog.TAU / 4, z: Zdog.TAU / 4 },
    color: "#222",
    stroke: 5,
    backface: false,
});

var ringGroup = new Zdog.Group({
    addTo: bee,
});

let corpus = new Zdog.Shape({
    addTo: ringGroup,
    path: [{ x: -20 }, { x: 20 }],
    stroke: 40,
    color: '#EA0'
});

let ring = new Zdog.Ellipse({
    addTo: ringGroup,
    diameter: 45,
    rotate: { y: Zdog.TAU / 4, z: Zdog.TAU / 4 },
    translate: { x: 0 },
    color: "#222",
    stroke: 5,
});

ring.copy({
    translate: { x: 10 }
})

ring.copy({
    diameter: 40,
    translate: { x: 20 }
})

ring.copy({
    diameter: 35,
    translate: { x: 30 }
})

ring.copy({
    diameter: 10,
    translate: { x: 40 }
})

let counter = 1;

function animate() {
    if (isSpinning) {
        bee.rotate.y += 0.03;
    }
    else if (isThinking) {
        bee.rotate.y += 0.1;
    }
    bee.updateRenderGraph();
    requestAnimationFrame(animate);
}

animate();