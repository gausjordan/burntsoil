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
 * TODO: Array size must equal the size of the biggest display (network game).
 * @param {*} cps an array of control point objects
 * @param {*} cWidth canvas width in pixels (oversampling is possible)
 * @param {*} isLowered generate ultra-low terrain (for the main menu)
 * @returns an array of normalized control points
*/
function normalizeCps(cps, cWidth, isLowered) {
    cWidth--;   // Array starts at 0, no need for the last one
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
 * @param {*} terrainColor (optional) CSS color
 * @param {*} from (optional) partial redraw beginning
 * @param {*} to (optional) partial redraw end
 */
function drawTerrain(pixels, squeezeFactor, terrainColor, from, to) {

    if (terrainColor == undefined) {
        canvCtx2.fillStyle = globalTerrainColor;
    } else {
        canvCtx2.fillStyle = terrainColor;
    }
    
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


/**
 * A series of actions taken once the weapon misses and hits the ground
 * @param {*} x 
 * @param {*} y 
 * @param {*} blastSize 
 */
async function explosionOnGround(x, y, blastSize) {
    xSqz = x * squeezeFactor;
    ySqz = canvRef2.height - (y * squeezeFactor);
    blastSqz = blastSize * squeezeFactor;
    
    let upArc = generateUpperArc(x, y, blastSize);
    let lowArc = generateLowerArc(x, y, blastSize);

    await drawFireball(x, y, blastSize);
    await clearFireball(xSqz, ySqz, blastSqz);
    let debris = collectDebris(upArc, lowArc, pxMix);
    await drawDebris(debris, squeezeFactor, lowArc, blastSize);
    


    //let soilAbove = soilAboveGenerator(upperArc);
    //let damageSpan = getCarveLimits(lowerArc);
    //carve(lowerArc, drawTerrain);
    // drawTerrain(pxMix, squeezeFactor);
    //drawDebris(soilAbove, squeezeFactor, damageSpan, upperArc);
}


function collectDebris(upArc, lowArc, pxMix, blastSize) {
    let debrisAbove = [];
    for (u in upArc) {
        if (upArc[u] < pxMix[u]) {
            debrisAbove.push(
                {
                    x: u,
                    y_top: pxMix[u],
                    y_middle: upArc[u],
                    y_bottom: lowArc[u]
                }
            );
        } else {
            debrisAbove.push(
                {
                    x: u,
                    y_top: upArc[u],
                    y_middle: upArc[u],
                    y_bottom: lowArc[u]
                }
            );
        }
    }
    return debrisAbove;
   
    /*
    // debug visualizer
    for (v in upArc) {
        canvCtx2.fillStyle = "pink";
        canvCtx2.fillRect(
            v*squeezeFactor,
            (canvRef2.height - upArc[v] * squeezeFactor), 
            1,
            1);
    }

    for (v in lowArc) {
        canvCtx2.fillStyle = "cyan";
        canvCtx2.fillRect(
            v*squeezeFactor,
            (canvRef2.height - lowArc[v] * squeezeFactor), 
            1,
            1);
    }
    */
}


/**
 * Draws an animated explosion
 * @param {*} x x coordinate (full oversampled resolution)
 * @param {*} y y coordinate (full oversampled resolution)
 * @param {*} blastSize blast radius ("downsampled", display size)
 * @returns 
 */
function drawFireball(x, y, blastSize) {

    let grad = canvCtx2.createRadialGradient(
               xSqz, ySqz, 0, xSqz, ySqz, blastSqz);
    grad.addColorStop(0, "red");
    grad.addColorStop(1, "black");
    canvCtx2.fillStyle = grad;
    canvCtx2.beginPath();
    canvCtx2.arc(xSqz, ySqz, 0, 0, 2 * Math.PI);
    canvCtx2.fill();

    return new Promise(resolve => {
        let currentRadius = 0;
        let startTime = performance.now();
        function animateFire(timeStamp) {

            if (currentRadius < blastSqz) {
                requestAnimationFrame(animateFire);
                currentRadius = Math.min(
                        (timeStamp - startTime) / blowUpSpeed * blastSqz,
                        blastSqz
                    );
                if ( currentRadius < 0 ) currentRadius = 0;
                canvCtx2.fillStyle = grad;
                canvCtx2.beginPath();
                canvCtx2.arc(xSqz, ySqz, currentRadius, 0, 2 * Math.PI);
                canvCtx2.fill();
            }
            else {
                lock = false;
                resolve();
            }
        }
        requestAnimationFrame(animateFire);
    })
}


/**
 * Clears the (animated) explosion, leaving a transparent patch on the canvas
 * @param {*} x x coordinate (full oversampled resolution)
 * @param {*} y y coordinate (full oversampled resolution)
 * @param {*} blastSize blast radius ("downsampled", display size)
 * @returns 
 */
function clearFireball(x, y, blastSqz) {
    let currentIndex = 0;
    let lastIndex = 0;
    let quarterCircle = pixelatedArch(blastSqz);

    return new Promise(resolve => {
        let startTime = performance.now();
        function animateFire(timeStamp) {
            blastSqz = Math.round(blastSqz);
            if ( lastIndex < blastSqz ) {
                   
                lastIndex = currentIndex;
                currentIndex = Math.round(
                        Math.min(
                            (timeStamp - startTime) / blowUpSpeed * blastSqz,
                            blastSqz
                        )
                    );
                
                // It takes 12 passes to erase all anti-aliasing leftovers
                for (let k = 0; k < 12; k++) {
                    for (let j = lastIndex; j < currentIndex; j++ ) {
                        canvCtx2.clearRect(
                            x - quarterCircle[j].width,
                            y + quarterCircle[j].heigth,
                            quarterCircle[j].width * 2,
                            1);
        
                        canvCtx2.clearRect(
                            x - quarterCircle[j].width,
                            y - quarterCircle[j].heigth - 0.55,
                            quarterCircle[j].width * 2,
                            1);
                    }
                }
                requestAnimationFrame(animateFire);

            } else {
                lock = false;
                resolve();
            }
        }
        requestAnimationFrame(animateFire);
    })
}


function drawDebris(debris, squeezeFactor, lowArc, blastSize) {

    let sF = squeezeFactor;
    let maxShift = 2 * (blastSize + 1) * squeezeFactor;
    
    // First and last elements of the debris array
    let first = debris.slice(-debris-length)[0];
    let last = debris.slice(-1)[0];
    
    // If an explosion touches the left edge of a canvas, the array gets
    // shifted: leftmost X value is zero, followed by positive X's,
    // folowed by negative X's. Then, trueFirst/trueLast is used instead.
    let trueFirst = last;
    let trueLast = debris[debris.length + Number(trueFirst.x) - 1];

    // Collects data required to redraw erased area below the explosion
    let path = new Path2D();

    for (d in debris) {
        if (debris[d].y_bottom < pxMix[debris[d].x]) {
            path.lineTo(
                debris[d].x * sF,
                canvRef2.height - debris[d].y_bottom * sF
            );
        } else {
            path.lineTo(
                debris[d].x * sF,
                canvRef2.height - pxMix[debris[d].x] * sF
            );
        }
    }

    if (last.x > 0) {
        path.lineTo(debris[debris.length-1].x * sF, canvRef2.height);
        path.lineTo(debris[0].x * sF, canvRef2.height);
        path.lineTo(debris[0].x * sF, debris[0].y_bottom * sF);
    } else {
        path.lineTo(trueLast.x * sF, canvRef2.height);
        path.lineTo(trueFirst.x * sF, canvRef2.height);
        path.lineTo(trueFirst.x * sF, trueFirst.y_bottom * sF);
    }
    path.closePath();
    
    canvCtx2.fillStyle = "rgba(0,255,0,1)";

    return new Promise(resolve => {

        let brakeDown;
        let startTime = performance.now();
   
        function animateDebris(timeStamp) {

            console.log(
                (timeStamp - startTime) / 16
                
                );

            if (maxShift > 0) {
                // Erasing area above the explosion
                // In most cases: it exploded on-screen, or far to the right
                if (last.x > 0) {
                    canvCtx2.clearRect(
                        first.x * sF,
                        0,
                        (last.x - first.x) * sF,
                        canvRef2.height
                    );
                }
                // Exception: An explosion touches the left edge of a canvas
                else {                  
                    canvCtx2.clearRect(
                        (trueFirst.x) * sF,
                        0,
                        (trueLast.x - trueFirst.x) * sF,
                        canvRef2.height
                    );
                }

                
                // Redraws area above the explosion
                canvCtx2.fillStyle = "rgba(255,255,0,1)";
                for (d in debris) {

                    canvCtx2.fillRect(
                        debris[d].x * sF,
                        canvRef2.height - debris[d].y_top * sF,
                        1,
                        (debris[d].y_top - debris[d].y_middle ) * sF
                    );

                    brakeDown = startTime / blowUpSpeed / 30;

                    // Shifts the debris field array down by one
                    if (debris[d].y_middle > debris[d].y_bottom) {
                        debris[d].y_top = debris[d].y_top - (1 / sF);
                        debris[d].y_middle = debris[d].y_middle - (1 / sF);
                    }
                }
                
                // Redraws cleared soil below the explosion
                //canvCtx2.fillStyle = "rgba(255,0,255,1)";
                canvCtx2.fill(path);
                
                requestAnimationFrame(animateDebris);

                startTime = timeStamp;

            } else {
                resolve();
            }

            maxShift--;

            //downShift = downShift - 3;

            
        }
        requestAnimationFrame(animateDebris);
    })
}


/**
 * Constructs an array of pixels describing a circle, one (x,y) pair per pixel
 * @param {*} radius 
 * @returns an array of pixel coordinate pairs
 */
function pixelatedArch(radius) {
    let pxArch = [];
    for (let i = 0; i <= radius; i++) {
        let angle = Math.asin(i / radius);
        let length = radius  * Math.cos(angle);
        pxArch.push({ heigth: i, width: length});
    }
    return pxArch;
}


/** Compute a lower semi-circle shape for the future carving */
function generateUpperArc(dx, dy, r) {
    let upperArc = {};
    for(let i = 0; i < 180; i += 0.01) {
        let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
        let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
        upperArc[x] = y;
    }
    return upperArc;
}


/** Compute an upper semi-circle shape above which terrain is unaffected */
function generateLowerArc(dx, dy, r) {
    let lowerArc = {};
    for(let i = 180; i < 360; i += 0.01) {
        let x = Math.round(dx + r * Math.cos(i * Math.PI / 180));
        let y = Math.round(dy + r * Math.sin(i * Math.PI / 180));
        lowerArc[x] = y;
    }
    return lowerArc;
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
}




function getCarveLimits(lowerArc) {
    let beginning = Object.keys(lowerArc)[0];
    let end = Object.keys(lowerArc)[Object.keys(lowerArc).length - 1];
    console.log("Carve limit beginning: " + beginning);
    console.log("Carve limit ending: " + end);
    return [beginning, end];
}