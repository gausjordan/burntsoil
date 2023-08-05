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





/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {

});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    rect = canvasRef.parentElement.getBoundingClientRect();
    canvasRef.height = flexMain.clientHeight - 8;
    canvasRef.width = flexMain.clientWidth - 8;
    backdrop(canvasRef.width, canvasRef.height);
    testDraw2(buildTerrain(canvasRef.width, canvasRef.height, true));
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
 * TODO: can be optimized by splitting the work in two correlated functions
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
    let widthInPx = -2 * maxDist;
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


/**
 * Converts an array of control points to an array of pixel height values.
 * @param {*} cps An array of curve control point objects (x and y coordinates)
 * @param {*} screenWidth Screen (canvas) width in pixels
 * @returns A "screen-width long" array of absolute pixel hight values
 */
function cpsToPxs(cps, screenWidth) {
    let oldX = 0;
    const pixels = new Array();

    // For each segment, defined by four points, but only two points long
    for (let seg = 0; seg < cps.length-3; seg+=1) {
        let step = 1 / Math.abs(cps[seg+1].x - cps[seg+0].x);
        
        // Compute interpolated coordinates at location 't' in range [0-1]
        for (let t = 0; t < 1; t += step/5) {

            let x = Math.round(cubicInterpolate(
                    cps[seg+0].x, cps[seg+1].x,cps[seg+2].x, cps[seg+3].x, t));

            // Skip repeating values
            if (x == oldX) { continue; }

            let y = Math.round(cubicInterpolate(
                    cps[seg+0].y, cps[seg+1].y, cps[seg+2].y, cps[seg+3].y, t));

            // Array starts at 0, screen positions start at 1
            if (x > 0 && x <= screenWidth) {
                pixels[x-1] = y;
                oldX = x-1;
            }
        }
    }
    return pixels;
}


/**
 * Builds random terrain out of an array of control point objects (x and y
 * coordinates) by adding up two curves, containing low and high frequency
 * content respectively.
 * @param {*} width - canvas width (in pixels)
 * @param {*} height - canvas height (in pixels)
 * @param {*} isLow - if 'true', terrain gets lowered to show more background
 * @returns an array of pixel height values, one for each vertical line
 */
function buildTerrain(width, height, isLow) {
    let magicNums = isLow ? [4, 2, 0.5, 0.1,   7, 5, 0.15, 0.5]
                          : [4, 2, 0.1, 0.3,   10, 8, 0.75, 0.6];
    let loResCps = generateCps( width / magicNums[0],
                                width / magicNums[1],
                                height * magicNums[2],
                                height - height * magicNums[3]);
    let hiResCps = generateCps( width / magicNums[4],
                                width / magicNums[5],
                                height * magicNums[6],
                                height - height * magicNums[7]);
    let loResArr = cpsToPxs(loResCps, width);
    let hiResArr = cpsToPxs(hiResCps, width);

    let landscapeArrayMix = loResArr.map( (n, i) => n + 0.4 * hiResArr[i] );
    return landscapeArrayMix;
}


/**
 * Draws a passive, more or less colorful, backdrop/background
 * @param {*} width canvas width in pixels
 * @param {*} height canvas height in pixels
 * @param {*} typeOf several styles to choose from (TODO)
 */
function backdrop(width, height, typeOf) {
    let r = 42;
    let g = 40;
    let b = 140;
    let string;
    let step = Math.round(height/28);
    for (let i = 0; i < height; i += step) {
        r += 9;

        if (i <= 8*step) {
            g += 8;
            b += 14;
        } else if (i > 8*step && i <= 17 * step) {
            g -= 4;
            b -= 14;
        } else if (i > 19 * step) {
            g += 14;
            b -= 14;
        }

        string = "rgb(" + r + "," + g + "," + b + ")";
        canvasCtx.fillStyle = string;
        canvasCtx.fillRect(0, i, width, Math.round(height/28));
    }
    
    // Drawing a centered sun, slightly to the left, filling half the screen
    let horizSunPos = width / 2.2;
    let vertSunPos = height;
    let sunSize = width < height ? width / 2 : height / 2;
    canvasCtx.fillStyle = "#FFFF00";
    canvasCtx.beginPath();
    canvasCtx.arc(horizSunPos, vertSunPos, sunSize, Math.PI, 0);
    canvasCtx.fill();
}



function draw(landscapeArray1D) {
    canvasCtx.fillStyle = "rgba(0,255,0,255)";
    for (let i = 0; i < landscapeArray1D.length; i++) {
        canvasCtx.fillRect(i, landscapeArray1D[i], 1, 1000);
    }
}