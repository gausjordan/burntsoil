let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
canvasSizeFormatterIndex(10, 10);
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');
document.getElementById("curtain").style.height = canvRef1.height / ratio + "px";
document.getElementById("curtain").style.width = canvRef1.width / ratio + "px";

// Check all players and get the widest screen resolution possible
// Temporarily hardcoded
let maxRes = 6000;

let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain
let normPoints1 = normalizeCps(rawPoints1, maxRes, true);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
let squeezeFactor = canvRef2.width / pxMix.length;

// Draws graphics. Backdrop is always on canvas1, game elements are on canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "sunset");
drawTerrain(pxMix, squeezeFactor);


// Drawing
canvCtx1.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    canvCtx2.font = "16px Arial";
    canvCtx2.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvCtx2.fillText(colorValueAtPos, 10, 30);
    }
}

function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();