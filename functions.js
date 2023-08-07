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
    let sunSize = width < height ? width / 1.6 : height / 1.6;
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

}