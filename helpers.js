/**
 * Calculate canvas' parent size before it's drawn
 * @param {*} canvas canvas reference
 * @param {*} hMargin sum of horizontal border widths
 * @param {*} vMargin sum of vertical border widths
 * @returns an array of two values: width and height
 */
function getCanvSize(canvas, hMargin, vMargin) {
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
 * Returns an interpolated function value on a segment fraction 't'
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


/** Ensures correct aspect ratio an most display types */
function canvasSizeFormatter() {
    let aspect = document.getElementsByTagName("html")[0].clientWidth /
                 document.getElementsByTagName("html")[0].clientHeight;

    if (aspect < 2.2) {
        document.getElementsByTagName("body")[0].style.width = "100%";
    }
    else if (aspect => 2.2) {
        document.getElementsByTagName("body")[0].style.width =
            document.getElementsByTagName("html")[0].clientHeight * 2.2 + "px";
    }   
    updateCanvasSize();
}


/** Gets (new) available screen size for the canvas */
function updateCanvasSize() {
    canvRef.width = getCanvSize(canvRef, 8, 8)[0] * ratio;
    canvRef.height = getCanvSize(canvRef, 8, 8)[1] * ratio;
    canvRef.style.width = canvRef.width / ratio + "px";
    canvRef.style.height = canvRef.height / ratio + "px";
}