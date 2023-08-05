/* Debug draw points function - not to be used */
function debugDrawPoints() {
    canvasCtx.fillStyle = "rgba(0,0,255,255)";
    for (let i=0; i < controlPoints.length; i++) {
        canvasCtx.fillRect(controlPoints[i].x, controlPoints[i].y, 6, 6);
    }
}

/* Draws outline off of a pixel array */
function testDraw2(landscapeArray1D) {
    canvasCtx.fillStyle = "rgba(0,255,0,255)";
    for (let i = 0; i < landscapeArray1D.length; i++) {
        canvasCtx.fillRect(i, landscapeArray1D[i], 1, 1000);
    }
}


/* Debug draw curves function - not to be used */
function debugDrawCurves() {
    try { return; }
    catch {
        return;
    }
    
    canvasCtx.fillStyle = "rgba(255,0,0,160)";

    for (let seg = 0; seg < controlPoints.length-3; seg+=1) {
        let c1 = randomInteger(0,235);
        let c2 = randomInteger(0,235);
        let c3 = randomInteger(0,235);
         // console.log("Segment " + seg + " je širok " + (cps[seg+1].x - cps[seg+0].x) + " piksela. Jedan korak je: " + step);
        let string = "rgb(" + c1 + "," + c2 + "," + c3 + ")";
           canvasCtx.fillRect(controlPoints[seg+0].x, controlPoints[seg+0].y, 6, 6);
        canvasCtx.fillStyle = string;
        let px = 0;
        let step = 1 / Math.abs(controlPoints[seg+1].x - controlPoints[seg+0].x);
        for (let t = 0; t < 1; t += step/4) {
                let x = cubicInterpolate(controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, controlPoints[seg+3].x, t);
                let y = cubicInterpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
                canvasCtx.fillRect( Math.round(x), Math.round(y), 1, 30);
        }
        px += controlPoints[seg+1].x-controlPoints[seg+0].x;
    }

    let px = -200;
    for (let seg = 0; seg < controlPoints.length-3; seg+=1) {
        let c1 = randomInteger(0,235);
        let c2 = randomInteger(0,235);
        let c3 = randomInteger(0,235);
        
        //let string = "rgb(" + c1 + "," + c2 + "," + c3 + ")";
           // canvasCtx.fillRect(controlPoints[seg+0].x, controlPoints[seg+0].y, 6, 6);
        //canvasCtx.fillStyle = string;
        
        let step = 1 / Math.abs(controlPoints[seg+1].x - controlPoints[seg+0].x);
        for (let t = 0; t < 1; t += step) {
                //let x = px;
                let y = cubicInterpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
                y = y + y*step;
                canvasCtx.fillRect( Math.round(px), Math.round(y), 1, 30);
                px = px + 1;
        }
        // px += controlPoints[seg+1].x-controlPoints[seg+0].x;
    }

}