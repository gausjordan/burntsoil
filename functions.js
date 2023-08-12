/**
 * Draws a passive backdrop / background
 * @param {*} width canvas width in pixels
 * @param {*} height canvas height in pixels
 * @param {*} typeOf several styles to choose from (TODO)
 */
function drawBackdrop(width, height, styleCode) {
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
        canvCtx.fillStyle = string;
        canvCtx.fillRect(0, i, width, (height/28)|0);
    }
    let horizSunPos = width / 2.2;
    let vertSunPos = height;
    let sunSize = width < height ? width / 1.6 : height / 1.6;
    canvCtx.fillStyle = "#FFFF00";
    canvCtx.beginPath();
    canvCtx.arc(horizSunPos, vertSunPos, sunSize, Math.PI, 0);
    canvCtx.fill();
}


/**
 * Generates random control points required to build a landscape curve.
 * Each control point is an object containing an X and a Y coordinate.
 * Values are relative (x,y) => [0-1000] and are to be scaled later.
 * @param pointCount number of control points to be generated
 * @returns an array of control point objects ('x' and 'y' pairs)
 */
function generateCps(pointCount) {
    let points = [];
    let minDist = 1000 / pointCount / 1.5;
    let maxDist = 1000 / pointCount + 0.5 * minDist;
    let progress = 0;
    for (let i = 0; i < pointCount; i++) {
        points.push ({
            x: progress + randomInteger(minDist, maxDist),
            y: randomInteger(0, 1000)
        });
        progress = points.slice(-1)[0].x;
    }
    return points;
}


/**
 * Scales the X coordinates to fit the canvas size, in pixels. Once done,
 * overshoots 1 point before and after the visible range, for the interpolator.
 * Scales the Y coordinates to fit up to 75% of an average landscape display.
 * TODO: Array size must equal the size of the biggest display (multiplayer).
 * @param {*} cps an array of control point objects
 * @param {*} cWidth canvas width in pixels (oversampling is possible)
 * @param {*} isLowered generate ultra-low terrain (for main menu)
 * @returns an array of normalized control points
*/
function normalizeCps(cps, cWidth, isLowered) {
    // Array starts at 0, no need for the last one
    cWidth--;
    let ceiling = isLowered ? 0.35 : 0.65
    let normalized = [];
    let upperLimit = cps[cps.length-2].x;       // second-to-last x
    let lowerLimit = cps[1].x                   // second x value
    let squeezeFactor = cWidth / (upperLimit - lowerLimit);
    normalized = cps.map( e => {
        return {
            // Width goes from 0 to the furtherest horizontal pixel
            x: (e.x - lowerLimit) * squeezeFactor,
            // Height goes up to "ceiling" percent, assuming a 16:9 ratio.
            y: (e.y * cWidth / (16/9) / 1000 * ceiling) }
        }
    );
    
    //normalized.forEach(c => canvCtx.fillRect(c.x, c.y, 1, -3000));
    return normalized;
}


/**
 * Converts an array of control points into a 1D array of pixel heights.
 * @param {*} cps array of control point objects (X and Y pairs)
 * @returns an array of pixel heights, left to right
 */
function cpsToPxs(cps) {
    let step = 0;
    let pixels = [];
    let detailLvl = 5;
    let newX = -1;
    let oldX = -2;

    for (let i = 1; i < cps.length-2; i+=1) {
        step = 1 / (cps[i+1].x - cps[i].x);
        for (let j = 0; j < 1; j += step / detailLvl ) {
            
            newX = Math.round(cubicInterpolate(
                cps[i-1].x, cps[i].x,cps[i+1].x, cps[i+2].x, j));

            if (newX != oldX) {
                pixels.push(cubicInterpolate(
                    cps[i-1].y, cps[i].y,cps[i+1].y, cps[i+2].y, j));
            }
            oldX = newX;
        }
    }
    return pixels;
}


function drawTerrain(pixels) {
    let squeezeFactor = canvRef.width / pixels.length;
    canvCtx.fillStyle = "rgba(0,255,0,1)";
    pixels.forEach( (c, index) =>
        canvCtx.fillRect(
            index * squeezeFactor,
            canvRef.height - (c * squeezeFactor),
            1,
            8000)
    );
}