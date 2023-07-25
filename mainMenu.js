 /* Sets HTML element references & sets up a canvas */
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


/* Generates random curve control points to build landscape from */
function generateControlPoints(minDist, maxDist, minHeight, maxHeight) {
    let widthInPx = -2 * maxDist;
    let points = [];
    let newPosition = 0;
    let newHeight = (maxHeight-minHeight) / 2;
    do {
        points.push ({
            x: (widthInPx + newPosition),
            y: newHeight });
        widthInPx += newPosition;
        newPosition = randomInteger(minDist, maxDist);
        newHeight = randomInteger(minHeight, maxHeight);
    } while (widthInPx <= flexMain.clientWidth + maxDist);

    return points;

}


/* Convert control points to a 1D array of landscape pixel heights */
function controlPointsToPixelHeights(cps) {

    let arrayOfHeights = [];
    for (let seg = 0; seg < cps.length-3; seg+=1) {
        let px = 0;
        let step = 1 / Math.abs(cps[seg+1].x - cps[seg+0].x);
        for (let t = 0; t < 1; t += step) {
            let x = cubicInterpolate(cps[seg+0].x, cps[seg+1].x, cps[seg+2].x, cps[seg+3].x, t);
            let y = cubicInterpolate(cps[seg+0].y, cps[seg+1].y, cps[seg+2].y, cps[seg+3].y, t);
                // canvasCtx.fillRect( cps[], Math.round(y), 1, 1); // DEBUG
            if ( (x >= 0) && (x <= canvasRef.width)) {
                arrayOfHeights.push(y);
            }
        }
        px += controlPoints[seg+1].y-controlPoints[seg+0].y;
    }
    console.log(arrayOfHeights);
}



let controlPoints = generateControlPoints(100, 250, 100, 650);
let landscapeArray1D = controlPointsToPixelHeights(controlPoints);
debugDrawPoints();
debugDrawCurves();



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