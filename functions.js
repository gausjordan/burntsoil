/**
 * Draws a passive backdrop/background
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
 * Values are relative (x,y) => [0-1000] and are to be normalized later.
 * @param pointCount number of control points to be generated
 * @returns an array of control point objects ('x' and 'y' pairs)
 */
function generateCps(pointCount) {
    let points = [];
    let minDist = 1000 / pointCount / 3;
    let maxDist = 1000 / pointCount + 2 * minDist;
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


function normalizeCps(cps) {
    alert("Gay!");
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

            let x = (cubicInterpolate(
                    cps[seg+0].x, cps[seg+1].x,cps[seg+2].x, cps[seg+3].x, t))|0;

            // Skip repeating values
            if (x == oldX) { continue; }

            let y = (cubicInterpolate(
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