//  Get HTML element references, setup a canvas
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


// Get pixel color value at a given mouse position, on click
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


// On resize - reset
window.addEventListener("resize", (ev) => {
    canvasRef.height = flexMain.clientHeight;
    canvasRef.width = flexMain.clientWidth;
    let pixelData = generateContour(cPoints);
    drawPixelData(pixelData);
});


// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


// Get a random integer in a given range
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}


// Create random (landscape) curve control points
function generateControlPoints() {

    let widthInPx = 0;
    let points = [];
    let newPosition = 0;
    let newHeight = 0;

    do {
        
        newHeight = randomInteger(500, 620);
        points.push ({
            x: widthInPx + newPosition,
            y: newHeight
        });
        newPosition = randomInteger(100, 140);
        widthInPx += newPosition;
    } while (widthInPx <= flexMain.clientWidth+400)

    return points;
}



// Takes control points in, returns an array of heights (landscape contour)
function generateContour(cPts) {

    // weights = [10, 5, 10, 15, 18, 2, 10, 15, 5, 10];
    let contour = new Array(canvasRef.width).fill(0);
    return contour;    
}





controlPoints = generateControlPoints();
// controlPoints.length = 5;

// controlPoints[0].x = 0;
// controlPoints[1].x = 200;
// controlPoints[2].x = 400;
// controlPoints[3].x = 600;
// controlPoints[4].x = 800;

// controlPoints[0].y = 200;
// controlPoints[1].y = 600;
// controlPoints[2].y = 400;
// controlPoints[3].y = 100;
// controlPoints[4].y = 200;

console.log(controlPoints.length);


// DEBUG draw

canvasCtx.fillStyle = "rgba(0,0,255,255)";
for (let i=0; i < controlPoints.length; i++) {
    canvasCtx.fillRect(controlPoints[i].x, controlPoints[i].y, 6, 6);
}

canvasCtx.fillStyle = "rgba(255,0,0,255)";
  
let px = 0;
let y = 0;

for (let seg = 0; seg < controlPoints.length-3; seg+=1) {
    
    for (let t=0; t<1; t+=0.01) {
        // This sorta worked, shifted
        // y = cubic_interpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
        // canvasCtx.fillRect( px + (controlPoints[seg+1].x-controlPoints[seg+0].x) * t , (canvasRef.height-y), 3, 3);

        if (seg == 0) {
            x = cubic_interpolate(controlPoints[seg+0].x, controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, t);
            y = cubic_interpolate(controlPoints[seg+0].y, controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, t);
            canvasCtx.fillRect( x, y, 3, 3);
            x = cubic_interpolate(controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, controlPoints[seg+3].x, t);
            y = cubic_interpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
            canvasCtx.fillRect( x, y, 3, 3);
        } else {
            x = cubic_interpolate(controlPoints[seg+0].x, controlPoints[seg+1].x, controlPoints[seg+2].x, controlPoints[seg+3].x, t);
            y = cubic_interpolate(controlPoints[seg+0].y, controlPoints[seg+1].y, controlPoints[seg+2].y, controlPoints[seg+3].y, t);
        }
        canvasCtx.fillRect( x, y, 3, 3);
    }
    px += controlPoints[seg+1].y-controlPoints[seg+0].y;
    
}



function cubic_interpolate(y0, y1, y2, y3, mu) {
    let a0, a1, a2, a3, mu2;
    mu2 = mu*mu;
    a0 = y3 - y2 - y0 + y1; //p
    a1 = y0 - y1 - a0;
    a2 = y2 - y0;
    a3 = y1;
    return ( a0*mu*mu2 + a1*mu2 + a2*mu + a3 );
}


function drawPixelData(pixelData) {
    canvasCtx.fillStyle = "rgba(0,0,255,1)";
    for (let i = 0; i < pixelData.length; i++) {
        // canvasCtx.fillRect(i, pixelData[i], 2, 2000);
    }
}


let cPoints = generateControlPoints();
let pixelData = generateContour(cPoints);
drawPixelData(pixelData);


// Drawing
canvasCtx.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    canvasCtx.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvasCtx.fillText(colorValueAtPos, 10, 30);
    }
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();