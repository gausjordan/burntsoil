canvasSizeFormatterGame(12, 12);

let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain

/*
// DEBUG: Fixed points
rawPoints1 = [{"x": 227,"y": 40}, {"x": 452,"y": 939}, {"x": 708,"y": 71}, {"x": 932,"y": 778}, {"x": 1147,"y": 165}];
rawPoints2 = [{"x": 74,"y": 933}, {"x": 202,"y": 800}, {"x": 303,"y": 518},{"x": 408,"y": 902}, {"x": 482,"y": 224},{"x": 588,"y": 315},{"x": 669,"y": 98},{"x": 774,"y": 889},{"x": 893,"y": 500},{"x": 982,"y": 761}];
*/

let normPoints1 = normalizeCps(rawPoints1, maxRes, false);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
squeezeFactor = canvRef2.width / pxMix.length;

// Backdrop always uses canvas1. Game elements use canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "blue");

canvCtx2.fillStyle = "rgba(255,0,0,1)"; 

let statusBar = document.getElementById('statusBar');

let tanks = [];
let whoseTurn = 0;

tanks.push(spawnTank(255, 0, 0, "Joe", 20, randomInteger(0, 180) ));
tanks.push(spawnTank(0, 160, 0, "Mike", 80, randomInteger(0, 180) ));
tanks.forEach(tank => tank.drawTank());
drawTerrain(pxMix, squeezeFactor);
updateStatusBar();

document.addEventListener('mousedown', dragStart);
document.addEventListener('touchstart', dragStart);

let startPosition;

function dragStart(e) {
    
    // Only do sometning when primary mouse button is pressed
    if (e.button === 0) {
        startPosition = {
            x: e.clientX,
            y: e.clientY
        }
        document.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragStop);
    }
    // Only do something there WAS a touch event
    if (e.touches && e.touches[0]) {
        startPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        document.addEventListener("touchmove", dragging);
        document.addEventListener("touchend", dragStop);
    }

}

function dragging(e) {
    if (e.button === 0) {
        // Only inc/dec once on every two move events (slower)
        if (e.clientX < startPosition.x && e.clientX % 2) {
            tanks[whoseTurn].angleInc();
        } else if (e.clientX % 2) {
            tanks[whoseTurn].angleDec();
        }
        tanks[whoseTurn].clearTank();
        tanks[whoseTurn].drawTank();
        updateStatusBar();
        startPosition = {
            x: e.clientX,
            y: e.clientY
        };
    }

    if (e.touches && e.touches[0]) {
        // Only inc/dec once on every three move events (much slower)
        if (e.touches[0].clientX < startPosition.x && e.touches[0].clientX % 3) {
            tanks[whoseTurn].angleInc();
        } else if (e.touches[0].clientX % 3) {
            tanks[whoseTurn].angleDec();
        }
        tanks[whoseTurn].clearTank();
        tanks[whoseTurn].drawTank();
        updateStatusBar();
        startPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }

}


function dragStop(e) {
    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseend", dragStop);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragStop);
}
