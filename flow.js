 /* Sets HTML element references & sets up a canvas */
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


/* Gets a pixel color value at a given mouse position - on click */
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


/* On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasRef.height = flexMain.clientHeight;
    canvasRef.width = flexMain.clientWidth;
    let pixelData = generateContour(cPoints);
    drawPixelData(pixelData);
});


/* Gets relative mouse coordinates on a canvas - on click */
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


/* Gets a random integer in a given range */
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}


/* Generates random curve control points to build landscape with */
function generateControlPoints(minDist, maxDist, minHeight, maxHeight) {
    let widthInPx = -2*maxDist;
    let points = [];
    let newPosition = 0;
    let newHeight = (maxHeight-minHeight)/2;
    do {
        points.push ({
            x: widthInPx + newPosition,
            y: newHeight });
        newPosition = randomInteger(minDist, maxDist);
        newHeight = randomInteger(minHeight, maxHeight);
        widthInPx += newPosition;
    } while (widthInPx <= flexMain.clientWidth + 2 * maxDist);
    return points;
}



// Takes control points in, returns an array of heights (landscape contour)
function generateContour(cPts) {

    // weights = [10, 5, 10, 15, 18, 2, 10, 15, 5, 10];
    let contour = new Array(canvasRef.width).fill(0);
    return contour;    
}


controlPoints = generateControlPoints(100, 150, 100, 650);
debugDraw();


/* Debug draw function - to be deleted */
function debugDraw() {
    canvasCtx.fillStyle = "rgba(0,0,255,255)";
    for (let i=0; i < controlPoints.length; i++) {
        canvasCtx.fillRect(controlPoints[i].x, controlPoints[i].y, 6, 6);
    }

    canvasCtx.fillStyle = "rgba(255,0,0,255)";

    for (let seg = 0; seg < controlPoints.length-3; seg+=1) {
        let px = 0;
        let step = 1 / (controlPoints[seg+2].x-controlPoints[seg+1].x);
        for (let t=0; t<1; t+=step/4) {

                let x = cubicInterpolate(controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, controlPoints[seg+3].x, t);
                let y = cubicInterpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
                canvasCtx.fillRect( x, y, 1, 100);
        }
        px += controlPoints[seg+1].y-controlPoints[seg+0].y;
        
    }
}




/* Returns an interpolated function value on a segment location 't' */
function cubicInterpolate(y0, y1, y2, y3, t) {
    let a0, a1, a2, a3, t2;
    t2 = t * t;
    a0 = y3 - y2 - y0 + y1;
    a1 = y0 - y1 - a0;
    a2 = y2 - y0;
    a3 = y1;
    return a0 * t * t2 + a1 * t2 + a2 * t + a3;
}


function drawPixelData(pixelData) {
    canvasCtx.fillStyle = "rgba(0,0,255,1)";
    for (let i = 0; i < pixelData.length; i++) {
        // canvasCtx.fillRect(i, pixelData[i], 2, 2000);
    }
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