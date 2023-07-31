let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight * window.devicePixelRatio;
canvasRef.width = flexMain.clientWidth * window.devicePixelRatio;

// DEBUG for mobile
document.getElementsByTagName('h1')[0].innerHTML =
    "Width: " + canvasRef.width + ", Height: " + canvasRef.height;



// let controlPoints = generateCps(100, 250, 100, 650);
let controlPoints1 = generateCps(canvasRef.width/3, canvasRef.width/1, canvas.height - canvas.height*0.6, canvas.height*0.85);
let controlPoints2 = generateCps(canvasRef.width/6, canvasRef.width/4, canvas.height - canvas.height*0.7, canvas.height*0.75);
let landscapeArray1D1 = cpsToPxs(controlPoints1, canvasRef.width);
let landscapeArray1D2 = cpsToPxs(controlPoints2, canvasRef.width);
// debugDrawPoints();

canvasCtx.fillStyle = "rgba(0,0,255,255)";
testDraw2(landscapeArray1D1);

canvasCtx.fillStyle = "rgba(255,0,0,255)";
testDraw2(landscapeArray1D2);


function buildCpsLayers(width, height, detailsLevel) {
    let controlPoints = generateCps(100, 250, 100, 650);
    for (let i = 0; i < detailsLevel; i++) {
        


    }
}


function testDraw2(landscapeArray1D) {
    for (let i = 0; i < landscapeArray1D.length; i++) {
        canvasCtx.fillRect(i, landscapeArray1D[i], 1, 1);
    }
}



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