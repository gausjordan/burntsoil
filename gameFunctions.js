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
    await carveArray(debris, squeezeFactor);
    tanks.forEach(t => t.drawTank());
    tanks.forEach(t => t.aftermathCheck());
    tanks.forEach(t => t.isShot(x,y));
}


/**
 * Changes (carves) the existing landscape after an explosion event
 * @param {*} debris an array of objects containing 4 explosion values
  */
function carveArray(debris, sF) {
    canvCtx2.fillStyle = "rgb(255,0,255)";
    return new Promise(resolve => {
        // Update debris to reflect it's final shape
        debris.forEach(v => {
            if (pxMix[v.x] > v.y_top) {
                pxMix[v.x] = v.y_bottom + (v.y_top - v.y_middle);
            }
        });
        lock = false;
        resolve();
    });
}


/** Returns coordinates where there's some dirt left ABOVE */
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
                resolve();
            }
        }
        requestAnimationFrame(animateFire);
    })
}


/**
 * Clears an (animated) explosion, leaving a transparent patch on canvas
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
                currentIndex = Math.round(Math.min(
                    (timeStamp - startTime) / blowUpSpeed*blastSqz, blastSqz));

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
                tanks.forEach((t) => t.drawTank());
                requestAnimationFrame(animateFire);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(animateFire);
    })
}

/** Any dirt left above the blast falls down and fills the hole */
function drawDebris(debris, squeezeFactor, lowArc, blastSize) {
    // Changes made while animating are only made on a disposable copy
    let debrisCopy = JSON.parse(JSON.stringify(debris));
    let sF = squeezeFactor;
    // First and last elements of the debris array
    let first = debrisCopy.slice(-debrisCopy-length)[0];
    let last = debrisCopy.slice(-1)[0];
    // If an explosion touches the left edge of a canvas, the array gets
    // shifted: leftmost X value is zero, followed by positive X's,
    // folowed by negative X's. Then, new first/last are defined instead.
    if (last.x < 0) {
        first = last;
        last = debrisCopy[debrisCopy.length + Number(first.x) - 1];
    }

    // Collects data required to redraw erased area below the explosion
    let path = new Path2D();
    for (d in debrisCopy) {
        if (debrisCopy[d].y_bottom < pxMix[debrisCopy[d].x]) {
            path.lineTo(
                debrisCopy[d].x * sF,
                canvRef2.height - debrisCopy[d].y_bottom * sF
            );
        } else {
            path.lineTo(
                debrisCopy[d].x * sF,
                canvRef2.height - pxMix[debrisCopy[d].x] * sF
            );
        }
    }
    
    path.lineTo(last.x * sF, canvRef2.height);
    path.lineTo(first.x * sF, canvRef2.height);
    path.lineTo(first.x * sF, first.y_bottom * sF);
    path.closePath();
    canvCtx2.fillStyle = "rgba(0,255,0,1)";

    return new Promise(resolve => {
        let startTime = performance.now();
        let dropSpeed;
        
        function animateDebris(timeStamp) {
            dropSpeed = (timeStamp - startTime) * blowUpSpeed / 1200;
            canvCtx2.clearRect(
                (first.x * sF) + 1,
                0,
                ((last.x - first.x) * sF) - 2,
                canvRef2.height
            );

            tanks.forEach((t) => t.drawTank());

            canvCtx2.fillStyle = globalTerrainColor;

            // Redraws area above the explosion
            let changesCount = 0;
            debrisCopy.forEach(v => {
                if (pxMix[v.x] > v.y_bottom) {
                    pxMix[v.x] = v.y_bottom - (v.y_middle - v.y_top);
                }
            });
            for (d in debrisCopy) {
                canvCtx2.fillRect(
                    debrisCopy[d].x * sF,
                    canvRef2.height - debrisCopy[d].y_top * sF,
                    1,
                    (debrisCopy[d].y_top - debrisCopy[d].y_middle ) * sF
                );
               
                // Exit condition: the soil either hits the ground
                // or it was a mid-air explosion; there's nothing to fall
                if (debrisCopy[d].y_middle >= debrisCopy[d].y_bottom
                    && debrisCopy[d].y_middle != debrisCopy[d].y_top) {
                    // Shift all the debris down by one
                    debrisCopy[d].y_top = debrisCopy[d].y_top - dropSpeed;
                    debrisCopy[d].y_middle = debrisCopy[d].y_middle - dropSpeed;
                    changesCount++;
                }
            }

            // Redraws cleared soil below the explosion
            canvCtx2.fill(path);
            if (changesCount <= 0) {
                changesCount = 0;
                resolve();
            } else {
                changesCount = 0;
                startTime = timeStamp;
                requestAnimationFrame(animateDebris);
            }
        }
        requestAnimationFrame(animateDebris);
    });
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


/** Computes a lower semi-circle shape for the future carving */
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
 * Creates a new player (Tank object) to be added to the array.
 * @param {*} r red
 * @param {*} g green
 * @param {*} b blue
 * @param {*} name name
 * @param {*} xPerc Where to place the tank horizontally (0 = left, 100 = right)
 * @param {*} angle Once spawned, the turret will be angled this far.
 * @returns 
 */
function spawnTank(r, g, b, name, xPerc, angle) {
    let tank = new Tank(r, g, b, name, xPerc, angle);
    return tank;
}


/** Update power, angle, name and weapon stats */
function updateStatusBar() {

    let displayAngle = tanks[whoseTurn].angle;
    
    // Internally, angle ranges 0 to 180, but only shows 0-90
    if (displayAngle > 90)
        displayAngle = 180 - displayAngle;
    statusBar.children[0].innerHTML = "Power: " + tanks[whoseTurn].power;
    statusBar.children[1].innerHTML = "Angle: " + displayAngle;
    
    // Player name (in plain text) matches it's tank's color
    let styleString = "rgb(" + (tanks[whoseTurn].r - 20) + ", "
        + (tanks[whoseTurn].g - 20) + ", "
        + (tanks[whoseTurn].b - 20) + ")";
    statusBar.children[2].style.color = styleString;
    statusBar.children[2].innerHTML = tanks[whoseTurn].name;
    statusBar.children[2].style.letterSpacing = "0.05em";
    statusBar.children[2].style.fontWeight = "bold";
    
}
