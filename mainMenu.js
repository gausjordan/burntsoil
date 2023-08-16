let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef = document.getElementById("canvas");
canvasSizeFormatter();
let canvCtx = canvRef.getContext('2d');
document.getElementById("curtain").style.height = canvRef.height / ratio + "px";
document.getElementById("curtain").style.width = canvRef.width / ratio + "px";

console.log(document.getElementById("curtain"));

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

drawBackdrop(canvRef.width, canvRef.height);
drawTerrain(pxMix);


// Drawing
canvCtx.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    canvCtx.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvCtx.fillText(colorValueAtPos, 10, 30);
    }
}

function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();