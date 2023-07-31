/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasRef.height = flexMain.clientHeight;
    canvasRef.width = flexMain.clientWidth;
    testDraw2(landscapeArray1D);
            // let pixelData = generateContour(cPoints);
            // drawPixelData(pixelData);
});


/** Gets relative mouse coordinates on a canvas, on click */
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


/** Gets a random integer in a given range */
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}


/**
 * Returns an interpolated function value on a segment location 't'
 * TODO: this can be optimized by splitting into two correlated functions
 */
function cubicInterpolate(y0, y1, y2, y3, t) {
    let a0, a1, a2, a3, t2;
    t2 = t * t;
    a0 = y3 - y2 - y0 + y1;
    a1 = y0 - y1 - a0;
    a2 = y2 - y0;
    a3 = y1;
    return a0 * t * t2 + a1 * t2 + a2 * t + a3;
}


/**
 * Generates random control points needed to build a landscape curve. The
 * total number of points is unknown (screen size dependent). This function
 * overshoots (produces extra points off-screen, required by the interpolator).
 * @param minDist minimum horizontal distance between two points (in pixels)
 * @param maxDist maximum horizontal distance between two points (in pixels)
 * @param minHeight minimum vertical distance between two points (in pixels)
 * @param maxHeight maximum vertical distance between two points (in pixels)
 * @returns an array of point objects: pairs of 'x' and 'y' values 
* */
function generateCps(minDist, maxDist, minHeight, maxHeight) {
    let newHeight = (maxHeight-minHeight) / 2;
    let widthInPx = -1 * maxDist;
    let newPosition = 0;
    let points = [];    
    
    do {
        points.push ({
            x: (widthInPx + newPosition),
            y: newHeight });
        widthInPx += newPosition;
        newPosition = randomInteger(minDist, maxDist);
        newHeight = randomInteger(minHeight, maxHeight);
    } while (widthInPx <= canvasRef.width + 2 * maxDist);

    return points;
}



/** Converts an array of control points to an array of pixel height values.
 * @param {Array} cps An array of curve control point objects (x and y coordinates)
 * @returns {(Array)} A "screen-width long" array of absolute pixel hight values
*/
function cpsToPxs(cps) {

    let oldX = 0;
    const pixels = new Array();

    // For each segment defined by four points, but only two points long
    for (let seg = 0; seg < cps.length-3; seg+=1) {
        let step = 1 / Math.abs(cps[seg+1].x - cps[seg+0].x);
        
        // Compute interpolated curve coordinates
        for (let t = 0; t < 1; t += step/5) {

            let x = Math.round(cubicInterpolate(
                    cps[seg+0].x, cps[seg+1].x,cps[seg+2].x, cps[seg+3].x, t));

            // Skip repeating values, this could be optimized further
            if (x == oldX) { continue; }

            let y = Math.round(cubicInterpolate(
                    cps[seg+0].y, cps[seg+1].y, cps[seg+2].y, cps[seg+3].y, t));

            if (x >= 0 && x <= canvasRef.width) {
                pixels[x] = y;
                oldX = x;
            }
        }
    }
    return pixels;
}