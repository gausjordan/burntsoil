/* Debug draw points function - not to be used */
function debugDrawPoints() {
    canvasCtx.fillStyle = "rgba(0,0,255,255)";
    for (let i=0; i < controlPoints.length; i++) {
        //canvasCtx.fillRect(controlPoints[i].x, controlPoints[i].y, 6, 6);
    }
}


/* Debug draw curves function - not to be used */
function debugDrawCurves() {
    canvasCtx.fillStyle = "rgba(255,0,0,160)";

    for (let seg = 0; seg < controlPoints.length-3; seg+=1) {
        let c1 = randomInteger(0,235);
        let c2 = randomInteger(0,235);
        let c3 = randomInteger(0,235);
        let string = "rgb(" + c1 + "," + c2 + "," + c3 + ")";
        // canvasCtx.fillRect(controlPoints[seg+0].x, controlPoints[seg+0].y, 6, 6);
        canvasCtx.fillStyle = string;
        let px = 0;
        let step = 1 / Math.abs(controlPoints[seg+3].x - controlPoints[seg+0].x);
        for (let t = 0; t < 1; t += step) {
                let x = cubicInterpolate(controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, controlPoints[seg+3].x, t);
                let y = cubicInterpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
                canvasCtx.fillRect( Math.round(x), Math.round(y), 2, 2);
        }
        px += controlPoints[seg+1].y-controlPoints[seg+0].y;
    }
}