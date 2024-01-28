// Resize screen height and re-center vertically on resize (virual keyboard)
let mainElement = document.getElementsByTagName("main")[0];
let canv = document.getElementById("canv");
let mHeight = mainElement.getBoundingClientRect().height;
let mWidth = mainElement.getBoundingClientRect().width;
let ctx = canv.getContext('2d');
let ratio = Math.ceil(window.devicePixelRatio);
let inputBar = document.getElementById("fname");
let doneButton = document.getElementById("done");
let backgroundAnimation;
let currPlayer;
let playersNum;
const playerColors = [[255, 0, 0], [0, 160, 0], [180, 0, 180],
                     [180, 180, 0], [0, 180, 180]];

canv.width = mWidth;
canv.height = mHeight;
ctx.width = mWidth / ratio + "px";
ctx.height = mHeight / ratio + "px";

// Do the next step when user is done by hitting "enter"
window.addEventListener('keypress', (ev) => {
    ev.stopPropagation();
    if (ev.key == "Enter") {
        ev.stopPropagation();
        ev.preventDefault();
        nextStep();
    }
    if (ev.key == "n" || ev.key == "N") {
        // if input isn't focused, gets it focused
        if (document.activeElement !== inputBar) {
            ev.stopPropagation();
            ev.preventDefault();
            inputBar.focus();
        }
    }
});

// Do the next step when user is done by clicking "Done"
doneButton.addEventListener('click', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    nextStep();
    inputSequence();
});


function inputSequence() {



    // Update status bar
    document.getElementById("currentPlayerInput").innerHTML = currPlayer + 1;
    document.getElementById("initPlayersNum").innerHTML = playersNum;

    if (backgroundAnimation)
        clearInterval(backgroundAnimation);

    drawVerticalBars(playerColors[currPlayer][0],
                     playerColors[currPlayer][1],
                     playerColors[currPlayer][2],
                     10, 20, 12);
}


function nextStep() {
    console.log("currPlayer+1 = " + (currPlayer+1) + ", playersNum = " + playersNum);
    if (currPlayer+1 < playersNum) {
        localStorage.setItem("currPlayer", currPlayer);
        localStorage.setItem("name" + currPlayer, inputBar.value);
        inputBar.value = "";
        currPlayer++;
        console.log("currPlayer+1 = " + (currPlayer) + ", playersNum = " + playersNum);
        inputSequence();
    }
    else if ((currPlayer + 1) >= playersNum) {
        localStorage.setItem("currPlayer", currPlayer);
        localStorage.setItem("name" + currPlayer, inputBar.value);
        window.location.href = 'game.html';
    }
}



window.addEventListener('resize', function() {
    mHeight = mainElement.getBoundingClientRect().height;
    mWidth = mainElement.getBoundingClientRect().width;
    mainElement.style.height = window.visualViewport.height + 'px';
    let screenHeight = Math.round(window.visualViewport.height);
    let formSize = Math.round(mainElement
                            .getElementsByClassName("frame")[0]
                            .getBoundingClientRect().height);
    // In landscape mode, keyboard may take up too much screen estate
    // For now, this is done via CSS (Done button disappears).
    if (formSize > window.visualViewport.height) {}
    canv.width = mWidth;
    canv.height = mHeight;
    ctx.width = mWidth / ratio + "px";
    ctx.height = mHeight / ratio + "px";

});



/**
 *  Draws animated horizontal bars of selected color
 * @param {*} r color component
 * @param {*} g color component
 * @param {*} b color component
 * @param {*} decrement how darker each bar gets
 * @param {*} threshold how dark is it going to get  */
function drawVerticalBars(r, g, b, decrement, threshold, barWidth) {
    let initGradient1 = generateColorGradient(r, g, b, decrement, threshold);
    let initGradient2 = structuredClone(initGradient1);
    initGradient2.shift();
    initGradient2.pop();
    let gradient = initGradient1.concat(initGradient2.reverse());
    let colorsNum = gradient.length;
    let i = 0;

    drawBarset();

    // Repeat background animation forever
    backgroundAnimation = setInterval( () => {
        gradientShift();
        drawBarset();
    }, 50);
    
    
    // Shift color palette
    function gradientShift() {
        let firstElement = gradient.shift();
        gradient.push(firstElement);
    }
    

    /** Draws one full frame of vertical bars  */
    function drawBarset() {
        i = 0;
        while ( (i * barWidth) < (mWidth) ) {
            ctx.fillStyle = `rgb(${gradient.at(i%colorsNum)[0]},
                                 ${gradient.at(i%colorsNum)[1]},
                                 ${gradient.at(i%colorsNum)[2]})`;
            ctx.fillRect(i*barWidth, 0, barWidth, 16000);
            i++;
        }
    }
}


/** Generates a gradient of colors, gradually turning dark
 * @param {*} r color component
 * @param {*} g color component
 * @param {*} b color component
 * @param {*} decrement how rapid each step is
 * @param {*} threshold how dark will it ultimately get
 * @returns array of RGB [0-255] integer triples
 */
function generateColorGradient(r, g, b, decrement, threshold) {
    let result = [[r, g, b]];
    let tempTriple = [];
    while (!canGoOn(result, threshold)) {
        tempTriple = [];
        result.at(-1).forEach( c => {
            if (c < threshold) {
                tempTriple.push(c);
            } else {
                if ( (c - decrement) > threshold) {
                    tempTriple.push(c - decrement);
                } else {
                    tempTriple.push(threshold);
                }
            }
        });
        result.push(tempTriple);
    }
    return result;
}


/** Returns "true" when any of the three color components,
 * unless it was zero to begin with, reaches the "threshold"
 * (lower limit of darkness). */
function canGoOn(gradient, threshold) {
    return gradient.at(-1)
        .filter(component => component !== 0)
        .some(component => (component == threshold));
}

// Get local storage
currPlayer = Number(localStorage.getItem("currPlayer"));
playersNum = Number(localStorage.getItem("numberOfPlayers"));


// Illegal state; go to main menu
if (currPlayer+1 > playersNum) {
    window.location.href = 'index.html';
}


// User came here manually via back button
// Allow renaming in the future, bounce for now
if (currPlayer != 0) {
    currPlayer = 0;
    window.location.href = 'index.html';
}


// Entry point    
inputSequence();