//  Get HTML element references, setup both canvases
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


// Get pixel color values at mouse position, on click event
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


// On resize - reset
window.addEventListener("resize", (ev) => {
    canvasRef.height = flexMain.clientHeight;
    canvasRef.width = flexMain.clientWidth;
    let pixelData = generateContour(cPoints);
    drawPixelData(pixelData);
});


// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


// Get a random integer in a given range
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}


// Create random (landscape) curve control points
function generateControlPoints() {
    let points = [];
    for (let i=0; i < 12; i++) {
        points[i] = randomInteger(50, 600);
    }
    return points;
}

// Takes control points in, returns an array of heights (landscape contour)
function generateContour(cPts) {

    let contour = new Array(canvasRef.width).fill(0);
    let pxPerSeg = Math.ceil((canvasRef.width) / (cPts.length-4));
    let stepPerPx = 1 / ((canvasRef.width) / (cPts.length-4));

    for (let seg=0; seg < cPts.length-4; seg++) {
        for (let px=0, step=0; px<pxPerSeg, step<1; px++, step += stepPerPx) {
            contour[(seg * pxPerSeg) + px] =
                Math.round(
                    catmullRom( cPts[seg], cPts[seg+1],
                    cPts[seg+2], cPts[seg+3], step)
                );
        }
    }
    return contour;    
}


function drawPixelData(pixelData) {
    canvasCtx.fillStyle = "rgba(0,0,255,1)";
    for (let i = 0; i < pixelData.length; i++) {
        canvasCtx.fillRect(i, pixelData[i], 2, 2000);
    }
}


// Returns a 4-point-curve segment value at position "t"
function catmullRom(p0, p1, p2, p3, t) {
    return (
        2 * p1 +
        t * (-p0 + p2) +
        t*t * (2*p0 - 5*p1 + 4*p2 - p3) +
        t*t*t * (-p0 + 3*p1 - 3*p2 + p3)
    ) * 0.5;
}


let cPoints = generateControlPoints();
let pixelData = generateContour(cPoints);
drawPixelData(pixelData);


// Drawing
canvasCtx.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    canvasCtx.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvasCtx.fillText(colorValueAtPos, 10, 30);
    }
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();