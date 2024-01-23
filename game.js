/*
// DEBUG: Fixed points
rawPoints1 = [{"x": 227,"y": 40}, {"x": 452,"y": 939}, {"x": 708,"y": 71}, {"x": 932,"y": 778}, {"x": 1147,"y": 165}];
rawPoints2 = [{"x": 74,"y": 933}, {"x": 202,"y": 800}, {"x": 303,"y": 518},{"x": 408,"y": 902}, {"x": 482,"y": 224},
             {"x": 588,"y": 315},{"x": 669,"y": 98},{"x": 774,"y": 889},{"x": 893,"y": 500},{"x": 982,"y": 761}];
*/

// Subtract total margin width from canvas, (re)size the canvas
canvasSizeFormatterGame(12, 12);

let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain

let normPoints1 = normalizeCps(rawPoints1, maxRes, false);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);
tankSize = parseInt(localStorage.getItem('tankSize'));
blastSize = parseInt(localStorage.getItem('blastSize'));

// Two arrays of unscaled (pixel-defined) curves, combined into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
squeezeFactor = canvRef2.width / pxMix.length;

// Backdrop always uses canvas1. Game elements use canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "blue");

let numberOfPlayers = localStorage.getItem('numberOfPlayers');
let tanks = [];         // An array of tank objects (all players)
let isBlocked = false;  // Block user controls while missiles fly
let whoseTurn = 0;      // Points to the current player

// Hardcoded players for testing purposes
if (numberOfPlayers >= 2)
    tanks.push(spawnTank(255, 0, 0, "Joe",
            randomInteger(5, 10),
            randomInteger(0,180) ));

if (numberOfPlayers >= 2)
    tanks.push(spawnTank(0, 160, 0, "Mike",
            randomInteger(85, 90),
            randomInteger(0, 180) ));

if (numberOfPlayers >= 3) {
    tanks.push(spawnTank(180, 0, 180, "Sam",
            randomInteger(40, 45),
            randomInteger(0, 180) ));
}

if (numberOfPlayers >= 4) {
    tanks.push(spawnTank(180, 180, 0, "Bob",
            randomInteger(20, 25),
            randomInteger(0, 180) ));
}

if (numberOfPlayers >= 5) {
    tanks.push(spawnTank(0, 180, 180, "Will",
            randomInteger(60, 65),
            randomInteger(0, 180) ));
}


tanks.forEach(tank => tank.drawTank());

let statusBar = document.getElementById('statusBar');
let navBar = document.getElementsByTagName('nav')[0];
drawTerrain(pxMix, squeezeFactor);
updateStatusBar();

// Prevent page refreshing on "swipe down" gesture (mobile browsers)
document.addEventListener('touchmove', (e) =>
                          e.preventDefault(),{passive:false});

// Set drag and touch events anywhere on screen
document.addEventListener('mousedown', dragStart);
document.addEventListener('touchstart', dragStart);

// Set drag and touch eventsfrom in-game control buttons
navBar.addEventListener('mousedown', fineTuneButtons);
navBar.addEventListener('touchstart', fineTuneButtons);


/** Do stuff, depending on what was touched or clicked */
async function fineTuneButtonAction(e) {

    if (e.srcElement.id == 'rotateCCW') {
        tanks[whoseTurn].angleInc(1);
    } else if (e.srcElement.id == 'rotateCW') {
        tanks[whoseTurn].angleDec(1);
    } else if (e.srcElement.id == 'incButton') {
        tanks[whoseTurn].powerInc(1);
    } else if (e.srcElement.id == 'decButton') {
        tanks[whoseTurn].powerDec(1);
    } else if (e.srcElement.id == 'fireButton') {
        await tanks[whoseTurn].fire();
    }
}
    

/** Define how buttons respond to either long press or long click */
 function fineTuneButtons(e) {
    
    if (typeof e.button !== 'undefined')
        // Only respond to primary clicks
        if (e.button !== 0)
            return;

    if (typeof e.button !== 'undefined' || e.touches[0] !== 'undefined') {
        e.preventDefault();             
        e.stopPropagation();            // Prevent double touch events
        fineTuneButtonAction(e);        // Do whatever is needed once
        if (e.srcElement.id             // Don't auto-repeat firing
            == 'fireButton')
            return;
        
        // If a button stays pushed - rapid repetition
        let timerId1, timerId2;
        timerId1 = setTimeout( () =>   { 
            timerId2 = setInterval(() => fineTuneButtonAction(e), 16); }, 600);

        // Cancel repetition if a pointing device was let go or moved away
        navBar.addEventListener('mouseup', () => clearTimers() );
        navBar.addEventListener('mouseleave', () => clearTimers());
        navBar.addEventListener('touchend', () => clearTimers() );
        navBar.addEventListener('touchleave', () => clearTimers());

        function clearTimers() {
            clearInterval(timerId1);
            clearInterval(timerId2);
        }
    }
}


let startPosition;  // Starting pointer position, before dragging

/** What to do if a pointer is engaged, anywhere on screen */
 function dragStart(e) {

    // Only do something when primary mouse button is pressed
    if (e.button === 0) {
        startPosition = {
            x: e.clientX, y: e.clientY
        }
        document.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragStop);
    }
    // Only do something if there WAS a touch event
    if (e.touches && e.touches[0]) {
        startPosition = {
            x: e.touches[0].clientX, y: e.touches[0].clientY
        };
        document.addEventListener("touchmove", dragging);
        document.addEventListener("touchend", dragStop);
    }
}


/** What to do if an engaged pointer starts moving */
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
        } else if (e.clientY > startPosition.y){
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

/** This happens when dragging on the canvas ends  */
function dragStop(e) {
    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseend", dragStop);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragStop);
}


/** Blocks controls while the missle is in the air */
function restoreFireListeners() {
    document.addEventListener('mousedown', dragStart);
    document.addEventListener('touchstart', dragStart);
    navBar.addEventListener('mousedown', fineTuneButtons);
    navBar.addEventListener('touchstart', fineTuneButtons);
    document.addEventListener('keydown', (keyDown));
}

/** Unblocks controls once the missle hits it's target */
function removeFireListeners() {
    document.removeEventListener('mousedown', dragStart);
    document.removeEventListener('touchstart', dragStart);
    navBar.removeEventListener('mousedown', fineTuneButtons);
    navBar.removeEventListener('touchstart', fineTuneButtons);
    document.removeEventListener('keydown', keyDown);

    // DEBUG... any key abruptly ends the animation
    document.addEventListener('keydown', () => {
        isBlocked = false;
    }, {once: true});
}