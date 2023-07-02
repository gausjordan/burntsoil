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

    canvasCtx.moveTo(0,0);

    var bezierPoints = [];

    for (let i=0; i < 32; i++) {
        bezierPoints[i] = randomInteger(50, 600);
        //console.log(bezierPoints);
        var bezierPoints = [360,75,241,128,109,503,261,274,419,499,188,194,494,158,80,557,158,471,336,118,435,63,475,322,439,460,177,331,224,204,556,327];
    }

    canvasCtx.fillStyle = "rgb(255,0,255)";
    canvasCtx.fillRect(canvasRef.width-1, canvasRef.height-1, 1, 1);
    canvasCtx.stroke();

    stepsNumber = Math.ceil(canvasRef.width / bezierPoints.length);

    let currentPixel = 0;

    for (let g = 0; g < bezierPoints.length; g++) {

        for (let i = 0; i < 1; i += 0.01) {
            
            canvasCtx.fillStyle = "rgb(0,0,0)";
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