/* Sets HTML element references & sets up a canvas */
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight * window.devicePixelRatio;
canvasRef.width = flexMain.clientWidth * window.devicePixelRatio;

//DEBUG
document.getElementsByTagName('h1')[0].innerHTML = "Width: " + canvasRef.width + ", Height: " + canvasRef.height;

/* Generates random curve control points to build landscape from */
function generateCps(minDist, maxDist, minHeight, maxHeight) {
    let widthInPx = -1 * maxDist;
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
    } while (widthInPx <= canvasRef.width + 2 * maxDist);
    // } while (widthInPx <= flexMain.clientWidth + 2 * maxDist);
    return points;
}



/** Converts an array of control points to an array of pixel height values.
 * @param {Array} cps An array of curve control point objects (x and y coordinates)
 * @returns {(Array)} A "screen-width long" array of absolute pixel hight values
*/
function cpsToPxs(cps) {

    let oldX = 0;
    const pixels = new Array();

    // For each segment defined by four points and framed by two
    for (let seg = 0; seg < cps.length-3; seg+=1) {
        let step = 1 / Math.abs(cps[seg+1].x - cps[seg+0].x);
        
        // Compute interpolated curve coordinates
        for (let t = 0; t < 1; t += step/5) {
            
            console.log("Iter");
            let x = Math.round(cubicInterpolate(
                    cps[seg+0].x, cps[seg+1].x,cps[seg+2].x, cps[seg+3].x, t));

            if (x == oldX) { continue; }

            let y = Math.round(cubicInterpolate(
                    cps[seg+0].y, cps[seg+1].y, cps[seg+2].y, cps[seg+3].y, t));

            if (x >= 0 && x <= canvasRef.width) {
                pixels[x] = y;
                oldX = x;
            }
        }
    }
    console.log(pixels);
    return pixels;
}

function testDraw2(landscapeArray1D) {
    let c1 = randomInteger(0,255);
    let c2 = randomInteger(0,255);
    let c3 = randomInteger(0,255);
    for (let i = 0; i < landscapeArray1D.length; i++) {
        c1 = c1 > 254 ? 0 : c1++;
        c2 = c2 > 254 ? 0 : c2++;
        c3 = c3 > 254 ? 0 : c3++;
        c1++;
        c2++;
        c3++;
        let string = "rgb(" + c1 + "," + c2 + "," + c3 + ")";
        canvasCtx.fillStyle = string;
        canvasCtx.fillRect(i, landscapeArray1D[i], 1, 10);
    }
}


//alert("Yo! " + canvasRef.width);
let controlPoints = generateCps(100, 250, 100, 650);
let landscapeArray1D = cpsToPxs(controlPoints);
debugDrawPoints();
debugDrawCurves();
testDraw2(landscapeArray1D);


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