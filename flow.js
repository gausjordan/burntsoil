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
    drawTerrain(terrain);
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

// Creates random landscape data
function createTerrain() {
    var bezierPoints = generatePoints();
    return bezierPoints;
}

// Generates random curve control points (landscape)
function generatePoints() {
    let bezierPoints = [];
    for (let i=0; i < 12; i++) {
        bezierPoints[i] = randomInteger(50, 600);
        
        // var bezierPoints = [360,75,241,128,109,503,261,274,
        //                     419,499,188,194,494,158,80,557,
        //                     158,471,336,118,435,63,475,322,
        //                     439,460,177,331,224,204,556,327];
    }
    return bezierPoints;
}


function generateContour(terrain) {
    let screenBuffer = new Array(canvasRef.width).fill(0);
    let pxPerSeg = Math.ceil((canvasRef.width) / (terrain.length-4));
    let stepPerPx = 1 / ((canvasRef.width) / (terrain.length-4));
    console.log("pxPerSegment: " + pxPerSeg);
    console.log("StepsPerPx: " + stepPerPx);

    for (let seg=0; seg < terrain.length-4; seg++) {
        for (let px=0, step=0; px<pxPerSeg, step<1; px++, step += stepPerPx) {
            screenBuffer[(seg * pxPerSeg) + px] =
                Math.round(
                    catmullRom(
                        terrain[seg],
                        terrain[seg+1],
                        terrain[seg+2],
                        terrain[seg+3],
                        step)
                );
        }
    }
    return screenBuffer;    
}


function drawPixelData(pixelData) {
    canvasCtx.fillStyle = "rgba(0,0,255,1)";
    for (let i = 0; i < pixelData.length; i++) {
        canvasCtx.fillRect(i, pixelData[i], 2, 2000);
    }
}


function drawTerrain(bezierPoints) {

    canvasCtx.fillStyle = "rgb(255,0,255)";
    canvasCtx.fillRect(canvasRef.width-1, canvasRef.height-1, 1, 1);
    canvasCtx.stroke();

    let currentPixel = 0;

    for (let g = 0; g < bezierPoints.length; g++) {
        for (let i = 0; i < 1; i += 0.01) {
            canvasCtx.fillStyle = "rgba(0,0,0,0.2)";
            currentPixel = catmullRom(bezierPoints[g+0], bezierPoints[g+1], bezierPoints[g+2], bezierPoints[g+3], i);
            canvasCtx.fillRect(i*100+(g*100), currentPixel, 2, 2);
        } 
    }
}

function catmullRom(p0, p1, p2, p3, t) {
    return (
        2 * p1 +
        t * (-p0 + p2) +
        t*t * (2*p0 - 5*p1 + 4*p2 - p3) +
        t*t*t * (-p0 + 3*p1 - 3*p2 + p3)
    ) * 0.5;
}




let terrain = createTerrain();
let pixelData = generateContour(terrain);
drawTerrain(terrain);
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