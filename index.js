canvasSizeFormatterIndex(10, 10);

document.getElementById("curtain").style.height = canvRef1.height / ratio + "px";
document.getElementById("curtain").style.width = canvRef1.width / ratio + "px";

let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain
let normPoints1 = normalizeCps(rawPoints1, maxRes, true);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
squeezeFactor = canvRef2.width / pxMix.length;

// Draws graphics. Backdrop is always on canvas1, game elements are on canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "sunset");

canvCtx2.fillStyle = "rgba(0,255,0,1)";
drawTerrain(pxMix, squeezeFactor);

// Drawing
canvCtx1.font = "16px sans-serif";

const playersNumButton = document.getElementById("playersNum");
const tankSizeButon = document.getElementById("tankSize");

playersNumButton.getElementsByTagName("span")[0].innerHTML = initPlayersNum;
playersNumButton.addEventListener("contextmenu", iterateNumberOfPlayers);
playersNumButton.addEventListener("click", iterateNumberOfPlayers);

tankSizeButon.getElementsByTagName("span")[0].innerHTML = initTankSize;
tankSizeButon.addEventListener("contextmenu", iterateTankSize);
tankSizeButon.addEventListener("click", iterateTankSize);

setNumberOfPlayers();
setTankSize();

/** Allow 2 to 5 players, for now */
function iterateNumberOfPlayers(e) {
    e.preventDefault();
    if (e.key == 'p' || e.button === 0)
        initPlayersNum++;
    else if (e.key == 'P' || e.button === 2)
        initPlayersNum--;
    if (initPlayersNum > 5)
        initPlayersNum = 2;
    else if (initPlayersNum < 2)
        initPlayersNum = 5;
    setNumberOfPlayers();
}


/** Allow 3 tank sizes */
function iterateTankSize(e) {
    e.preventDefault();
    if (e.key == 't' || e.button === 0)
        initTankSize++;
    else if (e.key == 'T' || e.button === 2)
        initTankSize--;
    if (initTankSize > 3)
        initTankSize = 0;
    else if (initTankSize < 0)
        initTankSize = 3;
    setTankSize();    
}

function setNumberOfPlayers() {
    playersNumButton.getElementsByTagName("span")[0].innerHTML = initPlayersNum;
    localStorage.setItem('numberOfPlayers', initPlayersNum);
}


function setTankSize() {
    switch (initTankSize) {
        case 0:
            tankSizeButon.getElementsByTagName("span")[0].innerHTML = "Tiny";
            localStorage.setItem('tankSize', 8);
            break;
        case 1:
            tankSizeButon.getElementsByTagName("span")[0].innerHTML = "Small";
            localStorage.setItem('tankSize', 12);
            break;
        case 2:
            tankSizeButon.getElementsByTagName("span")[0].innerHTML = "Medium";
            localStorage.setItem('tankSize', 18);
            break;
        case 3:
            tankSizeButon.getElementsByTagName("span")[0].innerHTML = "Chonky ";
            localStorage.setItem('tankSize', 26);
            break;
    }
    
}

function doDraw() {
    canvCtx2.font = "16px Arial";
    canvCtx2.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvCtx2.fillText(colorValueAtPos, 10, 30);
    }
}

function run() {
    requestAnimationFrame(run);
    doDraw();
}

run();