/**
 * Draws a passive backdrop / background
 * @param {*} width canvas width in pixels
 * @param {*} height canvas height in pixels
 * @param {*} typeOf background style
 */
function drawBackdrop(width, height, styleCode) {

    let r, g, b, step, string;
    
    switch (styleCode) {
        case 'sunset':
            r = 42;
            g = 40;
            b = 140;
            step = (height/28)|0;
            for (let i = 0; i < height; i += step) {
                r += 9;
                if (i <= 8*step) {
                    g += 8;
                    b += 14;
                } else if (i > 8*step && i <= 17 * step) {
                    g -= 5;     // -4
                    b -= 15;    // -14
                } else if (i > 19 * step) {
                    g += 14;
                    b -= 14;
                }
                string = "rgb(" + r + "," + g + "," + b + ")";
                canvCtx1.fillStyle = string;
                canvCtx1.fillRect(0, i, width, (height/28)|0);
            }
            let horizSunPos = width / 2.2;
            let vertSunPos = height;
            let sunSize = width < height ? width / 1.6 : height / 1.6;
            canvCtx1.fillStyle = "#FFFF00";
            canvCtx1.beginPath();
            canvCtx1.arc(horizSunPos, vertSunPos, sunSize, Math.PI, 0);
            canvCtx1.fill();
            break;
        case 'blue':
            r = 32;
            g = 32;
            b = 152;
            step = (height/28)|0;
            for (let i = 0; i < height; i += step) {
                r -= 2;
                g -= 2;
                b -= 1;
                string = "rgb(" + r + "," + g + "," + b + ")";
                canvCtx1.fillStyle = string;
                canvCtx1.fillRect(0, i, width, (height/28)|0);
            }
            break;
    }
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
 * Scales the Y coordinates to fit up to 60% of an average landscape display.
 * TODO: Array size must equal the size of the biggest display (multiplayer).
 * @param {*} cps an array of control point objects
 * @param {*} cWidth canvas width in pixels (oversampling is possible)
 * @param {*} isLowered generate ultra-low terrain (for the main menu)
 * @returns an array of normalized control points
*/
function normalizeCps(cps, cWidth, isLowered) {
    // Array starts at 0, no need for the last one
    cWidth--;
    let ceiling = isLowered ? 0.35 : 0.60
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


/**
 * Draws the terrain on screen, doing the downsampling as necessary
 * @param {*} pixels an array of pixel heights describing the landscape
 * @param {*} squeezeFactor how much smaller the display resolution is
 */
function drawTerrain(pixels, squeezeFactor, from, to) {
    if (from == undefined && to == undefined) {
        pixels.forEach(
            (c, index) =>
            canvCtx2.fillRect(
                index * squeezeFactor,
                canvRef2.height - (c * squeezeFactor),
                1,
                8000)
            );
    } else {
        for (let i = from; i < to; i++) {
            canvCtx2.fillRect(
                i * squeezeFactor,
                canvRef2.height - (pixels[i] * squeezeFactor),
                1,
                8000);
        }
    }
}


function drawDebris(soilAbove, squeezeFactor, damageSpan, upperArc) {
    //canvCtx2.fillStyle = "rgb(255,0,0)";
    
    for (let i = damageSpan[0]; i < damageSpan[1]; i++) {

        canvCtx2.fillRect(
            i * squeezeFactor,
            canvRef2.height - ( (soilAbove[i] + upperArc[i] ) * squeezeFactor),
            1,
            soilAbove[i] * squeezeFactor);
    }
}


function createExplosion(x) {

    let upperArc = generateUpperArc(x, pxMix[x], 300);
    let lowerArc = generateLowerArc(x, pxMix[x], 300);

    let soilAbove = soilAboveGenerator(upperArc);
    let damageSpan = carve(lowerArc);
    
    drawDebris(soilAbove, squeezeFactor, damageSpan, upperArc);

}


/** Compute a lower semi-circle shape for the future carving */
function generateLowerArc(dx, dy, r) {
    let lowerArc = {};
    for(let i = 180; i < 360; i += 0.01) {
        let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
        let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
        lowerArc[x] = y;
    }
    return lowerArc;
}


/** Compute an upper semi-circle shape above which terrain is unaffected */
function generateUpperArc(dx, dy, r) {
    let upperArc = {};
    for(let i = 0; i < 180; i += 0.01) {
        let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
        let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
        upperArc[x] = y;
    }
    return upperArc;
}


/**
 * Changes (carves) the existing landscape after an explosion event
 * @param {*} lowerArc a dictionary of coordinates to be carved out
 * @returns left and right blast limit on the x axis (array)
 */
function carve(lowerArc) {
    for (key in lowerArc) {
        if (lowerArc[key] < pxMix[key]) {
            pxMix[key] = lowerArc[key];
        }
    }
    let beginning = Object.keys(lowerArc)[0];
    let end = Object.keys(lowerArc)[Object.keys(lowerArc).length - 1];
    return [beginning, end];
}


/** Creates a dictionary of x and y values defining soil above the explosion */
function soilAboveGenerator(upperArc) {
    let soilAbove = {};
    
    for (key in upperArc) {
        if (upperArc[key] < pxMix[key]) {
            soilAbove[key] = pxMix[key] - upperArc[key];
        }
    }
    return soilAbove;
}


function animationTest() {
    var stopId;
    var progress = 0;
    var stopId;

    controller();

    function step(timestamp) {
        progress++;
        canvCtx2.fillRect(randomInteger(1,600), randomInteger(1, 600), 4, 4);
        console.log(progress);
        controller();
    }

    function controller() {
        if (progress < 140) {
            stopId = window.requestAnimationFrame(step);
        } if (progress > 140) {
            window.cancelAnimationFrame(stopId);
        }
        
        
    }

}




// function carveCircle(dx, dy, r) {
    
//     canvCtx2.fillStyle = "rgb(255,0,0)";
//     let lowerArc = {};
//     let upperArc = {};
//     let soilAbove = {};

//     // Compute a lower semi-circle shape for digging
//     for(let i = 180; i < 360; i += 0.01)
//     {
//         let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
//         let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
//         lowerArc[x] = y;
//     }

//     // Compute an upper semi-circle for the remaining soil to fall down
//     for(let i = 0; i < 180; i += 0.01)
//     {
//         let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
//         let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
//         upperArc[x] = y;
//     }

//     // Whatever needs to fall down becomes a new temporary dictionary
//     for (key in upperArc) {
//         if (upperArc[key] < pxMix[key]) {
//             soilAbove[key] = upperArc[key] - pxMix[key];
//         }
//     }

//     // Another short pixel array gets drawn
//     for (key in upperArc) {
//         canvCtx2.fillRect(
//             key * squeezeFactor,
//             canvRef2.height - (upperArc[key] * squeezeFactor),
//             1,
//             soilAbove[key] * squeezeFactor)
//     }



//     for (key in lowerArc) {

//         if (lowerArc[key] < pxMix[key]) {
//             pxMix[key] = lowerArc[key];
//         }

//         // // DEBUG
//         // canvCtx2.fillRect(
//         //         key * squeezeFactor,
//         //         lowerArc[key] * squeezeFactor,
//         //         1, 1);

//     }
// }




function drawCircle() {

}