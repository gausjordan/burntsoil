let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
canvasSizeFormatterGame(12, 12);
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');


// Check all players and get the widest screen resolution possible
// Temporarily hardcoded
let maxRes = 6000;

let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain
let normPoints1 = normalizeCps(rawPoints1, maxRes, false);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });

// Draws graphics. Backdrop is always on canvas1, game elements are on canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "blue");
drawTerrain(pxMix);
