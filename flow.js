//  Get HTML element references, setup both canvases
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


// Get pixel color values at mouse position, on click event
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


// On resize - reset
window.addEventListener("resize", (ev) => {
    canvasHeight = flexMain.clientHeight;
    canvasWidth = flexMain.clientWidth;
    canvasRef.height = canvasCtx.height = canvasHeight;
    canvasRef.width = canvasCtx.width = canvasWidth;
    drawTerrain();
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


function drawTerrain() {

    var bezierPoints = [200, 300, 100, 50, 700, 200, 20, 200, 600, 300, 500, 600, 50, 500, 50, 300, 200];

    for (let i=0, j=10; i<bezierPoints.length; i++, j+=60) {
        canvasCtx.fillStyle = "rgb(255,255,255)";
        canvasCtx.fillRect(j, bezierPoints[i], 4, 4);
    }

    for (let i=0, j=0; i<1; i += 0.01, j++) {
        let currentPixel = null;
        canvasCtx.fillStyle = "rgb(255,255,255)";
        currentPixel = catmullRom(bezierPoints[0], bezierPoints[1], bezierPoints[2], bezierPoints[3], i);
        canvasCtx.fillRect(j, currentPixel, 2, 2);

    }

    drawBez(bezierPoints);
}

function catmullRom(p0, p1, p2, p3, t) {
    return (
        2 * p1 +
        t * (-p0 + p2) +
        t*t * (2*p0 - 5*p1 + 4*p2 - p3) +
        t*t*t * (-p0 + 3*p1 - 3*p2 + p3)
    ) * 0.5;
}


function drawBez(b){

    canvasCtx.beginPath();
    canvasCtx.moveTo(0, 300);

    for (let i = 0, j = 0; i < b.length; i += 3, j += 200) {
        
        canvasCtx.bezierCurveTo(j+50, b[i],
                                j+100, b[i+1],
                                j+150, b[i+2],
                                );
        
        canvasCtx.stroke();
        canvasCtx.moveTo(j+150, b[i+2]);

    }


    // canvasCtx.moveTo(b[0].x,b[0].y);
    // canvasCtx.bezierCurveTo(b[1].x,b[1].y, b[2].x,b[2].y, b[3].x,b[3].y);
    // canvasCtx.stroke();
}



drawTerrain();

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