/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvRef, ev).x;
    posY = getMousePos(canvRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvRef.width = getCanvasSize(canvRef, 8, 8)[0] * ratio;
    canvRef.height = getCanvasSize(canvRef, 8, 8)[1] * ratio;
    canvRef.style.width = canvRef.width / ratio + "px";
    canvRef.style.height = canvRef.height / ratio + "px";
    drawBackdrop(canvRef.width, canvRef.height);
    drawTerrain(canvRef.width, canvRef.height, terrain, oldWidth, oldHeight);
});


/**
 * Calculate canvas' parent size before it's drawn
 * @param {*} canvas canvas reference
 * @param {*} hMargin sum of horizontal border widths
 * @param {*} vMargin sum of vertical border widths
 * @returns an array of two values: width and height
 */
function getCanvasSize(canvas, hMargin, vMargin) {
    let rect = canvas.parentElement.getBoundingClientRect();
    return [
        (rect.width - hMargin),
        (rect.height - vMargin)];
    }


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



/* TODO:

- generator ide od -500 do 1500
- on-screen sadrzaj je od 0 do 1000
- skalira se na canvas size po potrebi

*/



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
    } while (widthInPx <= canvRef.width + 2 * maxDist);
    
    return points;
}


/**
 * Invokes the generateCps function to generate random control points
 * Uses hardcoded magic numbers which tend to yield good aesthetics
 * @param {*} width canvas width in pixels
 * @param {*} height canvas height in pixels
 * @param {*} isLow if set to 'true' the terrain gets lower and flatter
 * @param {*} isHiFreq if set to 'true' the terrain gets more curvy
 * @returns an array of control point objects {x, y}
 */
function buildCps(width, height, isLow, isHiFreq) {
    let num1, num2, num3, num4;
   // Maintains widescreen compatibility, somewhat, by squeezing
   // in case someone decides to rotate their phone mid-game
   if (height > width) {
       height = 0.5 * (width/height) * width;
   }

   if (isLow) {
       if (isHiFreq) {
           num1 = 7; num2 = 5;  num3 = 0.15; num4 = 0.5;
       } else {
           num1 = 4; num2 = 2; num3 = 0.5; num4 = 0.1;
       }
   } else {
       if (isHiFreq) {
           num1 = 10; num2 = 8; num3 = 0.75; num4 = 0.6;
       } else {
           num1 = 4; num2 = 2; num3 = 0.1; num4 = 0.3;
       }
   }
   return generateCps( width / num1,
                       width / num2,
                       height * num3,
                       height - height * num4 );
}


/**
 * Converts two arrays of control points into pixels and combines them
 * @param {*} loResCps array of control points defining a low-frequency curve
 * @param {*} hiResCps array of control points defining a high-frequency curve
 * @param {*} width canvas width in pixels
 * @returns an array of pixel height values, one for each vertical line
 */
function combineCps(loResCps, hiResCps, width) {
    let loResArr = cpsToPxs(loResCps, width);
    let hiResArr = cpsToPxs(hiResCps, width);
    return loResArr.map( (n, i) => n + 0.4 * hiResArr[i] );
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
 * Draws a passive, more or less colorful, backdrop/background
 * @param {*} width canvas width in pixels
 * @param {*} height canvas height in pixels
 * @param {*} typeOf several styles to choose from (TODO)
 */
function drawBackdrop(width, height, typeOf) {
    let r = 42;
    let g = 40;
    let b = 140;
    let string;
    let step = (height/28)|0;
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
        canvasCtx.fillRect(0, i, width, (height/28)|0);
    }
    
    // A centered sun, slightly to the left, filling half the screen
    let horizSunPos = width / 2.2;
    let vertSunPos = height;
    let sunSize = width < height ? width / 1.5 : height / 1.5;
    canvasCtx.fillStyle = "#FFFF00";
    canvasCtx.beginPath();
    canvasCtx.arc(horizSunPos, vertSunPos, sunSize, Math.PI, 0);
    canvasCtx.fill();
}


function drawTerrain(width, height, array, oldWidth, oldHeight) {
    let hScalFct = array.length / width;
    let oldAbsoluteHeight = oldHeight - array[0];
    let newAbsoluteHeight = height - array[0];

    

    canvasCtx.fillStyle = "rgba(0,255,0,255)";
    
    for (let i = 0; i < width; i++) {
        canvasCtx.fillRect(
            i,
            (

                //(array[Math.round(i*hScalFct)] / hScalFct)
                (array[Math.round(i*hScalFct)])
            
            ),
            1,
            100000
        );
    }

    // for (let i = 0; i < landscapeArray1D.length; i++) {
    //     canvasCtx.fillRect(i, landscapeArray1D[i], 1, 1000);
    // }
}