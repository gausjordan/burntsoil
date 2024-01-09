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

// Two sets of (pixel-defined) curves merged into one (ratio 0.8 : 0.2)
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

// Prevents a page refresh upon "swipe down" gesture on mobile browsers
document.addEventListener(
    'touchmove',
    (e) => {e.preventDefault()},
    { passive: false });
    
document.addEventListener('mousedown', dragStart);
document.addEventListener('touchstart', dragStart);
// Captures events from all control buttons at once
document.getElementsByTagName('nav')[0]
    .addEventListener('mousedown', fineTuneButtons);
document.getElementsByTagName('nav')[0]
    .addEventListener('touchstart', fineTuneButtons);

let startPosition;

// What happens when one touches any of the in-game butttons
function fineTuneButtons(e) {
    
    // Prevents touch devices from registering multiple touch events
    e.stopPropagation();
    e.preventDefault();
    
    // Performs a button function once
    fineTuneButtonAction(e);
    
    // If a button stays pushed, rapid repetition begins
    let timerId1, timerId2;
    timerId1 = setTimeout( () =>   { 
                timerId2 = setInterval(() => { fineTuneButtonAction(e); }, 20);
            }, 600);

    // Auto repeating is canceled if button wasn't held down or we moved away
    document.getElementsByTagName('nav')[0]
        .addEventListener('mouseup', () => {
            clearInterval(timerId1);
            clearInterval(timerId2);
         });
    document.getElementsByTagName('nav')[0]
        .addEventListener('mouseleave', () => {
            clearInterval(timerId1);
            clearInterval(timerId2);
         });
    
    function timer(timerId) {
        setInterval(() => { fineTuneButtonAction(e); }, 20);
    }

    function repeater(timerId) {
        setInterval(() => { fineTuneButtonAction(e); }, 20);
    }
}




function fineTuneButtonAction(e) {
    if (e.srcElement.id == 'rotateCCW') {
        tanks[whoseTurn].angleInc(1);
    } else if (e.srcElement.id == 'rotateCW') {
        tanks[whoseTurn].angleDec(1);
    } else if (e.srcElement.id == 'incButton') {
        tanks[whoseTurn].powerInc(1);
    } else if (e.srcElement.id == 'decButton') {
        tanks[whoseTurn].powerDec(1);
    }
}

function killButtonRepeater() {

}


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
    // Only do something if there WAS a touch event
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
        // Set new angle via mouse
        if (e.clientX < startPosition.x) {
            tanks[whoseTurn].angleInc();
        } else if (e.clientX > startPosition.x) {
            tanks[whoseTurn].angleDec();
        }
        
        // Set new power level via mouse
        if (e.clientY < startPosition.y) {
            tanks[whoseTurn].powerInc();
        } else {
            tanks[whoseTurn].powerDec();
        }

        updateStatusBar();
        startPosition = {
            x: e.clientX,
            y: e.clientY
        };
    }

    if (e.touches && e.touches[0]) {
        // Set new angle via touch
        if (e.touches[0].clientX < startPosition.x) {
            tanks[whoseTurn].angleInc();
        } else if (e.touches[0].clientX > startPosition.x) {
            tanks[whoseTurn].angleDec();
        }

        // Set new power level via touch
        if (e.touches[0].clientY < startPosition.y) {
            tanks[whoseTurn].powerInc();
        } else if (e.touches[0].clientY > startPosition.y) {
            tanks[whoseTurn].powerDec();
        }

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
