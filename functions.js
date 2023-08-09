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
 * Scales the control points' X coordinate to fit the canvas size, in pixels.
 * Overshoots a point before and after the visible range, for the interpolator.
 * TODO: Array size must equal the size of the biggest display (multiplayer).
 */
function normalizeCps(cps, cWidth) {
    // We start at 0 and don't need the last pixel
    cWidth--;
    // A new array of point objects
    let normalized = [];
    // A second-to-last control points' X value
    let upperLimit = cps[cps.length-2].x;
    // A second X value of the array
    let lowerLimit = cps[1].x;
    // Scaling multiplier
    let squeezeFactor = cWidth / (upperLimit - lowerLimit);

    // Width goes from 0 to the furtherest horizontal pixel
    // Height goes up to 75%, assuming a 16:9 ratio.
    normalized = cps.map( e => {
        return {
            x: (e.x - lowerLimit) * squeezeFactor,
            y: (e.y * cWidth / (16/9) / 1000 / 0.75) }
        }
    );
    //DEBUG normalized.forEach(c => canvCtx.fillRect(c.x, c.y, 1, -3000));
    return normalized;
}


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

    console.log(pixels);
    canvCtx.fillStyle = "rgba(0,255,0,0.5)";
    pixels.forEach( (c, index) => canvCtx.fillRect(index, c, 1, 10));
}



function drawTerrain(width, height, array, oldWidth, oldHeight) {
    let hScalFct = array.length / width;
    let oldAbsoluteHeight = oldHeight - array[0];
    let newAbsoluteHeight = height - array[0];

    canvCtx.fillStyle = "rgba(0,255,0,255)";
    
    for (let i = 0; i < width; i++) {
        canvCtx.fillRect(
            i,
            (
                //(array[Math.round(i*hScalFct)] / hScalFct)
                (array[Math.round(i*hScalFct)])
            ),
            1,
            100000
        );
    }

}