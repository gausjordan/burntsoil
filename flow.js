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

    var bezierPoints=[{x:250,y: 120},{x:290,y:-40},{x:300,y:350},{x:400,y:150},
                      {x:500,y:150}, {x:600,y:90}, {x:700,y:100}, {x:800,y:300},
                      {x:900,y:450}, {x:950,y:90}, {x:1000,y:100}, {x:1050,y:300}];
    drawBez(bezierPoints);
}

function drawBez(b){

    canvasCtx.lineWidth=7;
    canvasCtx.beginPath();

    for (let i = 0; i < b.length; i = i + 3) {
        canvasCtx.moveTo(b[i].x, b[i].y)
        canvasCtx.bezierCurveTo(b[i+1].x, b[i+1].y,
                                b[i+2].x, b[i+2].y,
                                b[i+3].x, b[i+3].y
                                );
        canvasCtx.stroke();
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