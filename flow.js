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
    let pointPositions = [];
    let pointHeights = [];

    for (let i=0; i < 12; i++) {
        pointHeights[i] = randomInteger(80, 600);
    }
    
    // hardcoded debug points
    pointPositions = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
    // pointHeights = [100, 200, 100, 200, 100, 200, 100, 200];

    let points = pointPositions.map((currentValue, index) => {
        return {
            y: pointPositions[index],
            x: pointHeights[index]
        }
    });

    return points;
}



// Takes control points in, returns an array of heights (landscape contour)
function generateContour(cPts) {

    // weights = [10, 5, 10, 15, 18, 2, 10, 15, 5, 10];
    let contour = new Array(canvasRef.width).fill(0);
    return contour;    
}


controlPoints = generateControlPoints();

let proba = catmullRom(controlPoints, 0.5, 0.5, 0.5);



// DEBUG draw

canvasCtx.fillStyle = "rgba(0,0,255,255)";
for (let i=0; i < controlPoints.length; i++) {
    canvasCtx.fillRect(controlPoints[i].y, controlPoints[i].x, 6, 6);
}

canvasCtx.fillStyle = "rgba(255,0,0,255)";

    
    for (let j=0; j < controlPoints.length; j+=1) {

        for (let i=0; i < 1; i+= 0.005) {
            let temp1 = catmullRom(controlPoints[j+0], controlPoints[j+2], controlPoints[j+1], controlPoints[j+3], 0.5, 0.8, i);
            canvasCtx.fillRect(temp1.y, temp1.x, 3, 3);
        }
    }



testDraw();

function testDraw() {

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