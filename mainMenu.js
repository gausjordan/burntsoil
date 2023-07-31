let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight * window.devicePixelRatio;
canvasRef.width = flexMain.clientWidth * window.devicePixelRatio;

// DEBUG for mobile
document.getElementsByTagName('h1')[0].innerHTML =
    "Width: " + canvasRef.width + ", Height: " + canvasRef.height;


function testDraw2(landscapeArray1D) {
    for (let i = 0; i < landscapeArray1D.length; i++) {
        canvasCtx.fillRect(i, landscapeArray1D[i], 1, 10);
    }
}


let controlPoints = generateCps(100, 250, 100, 650);
let landscapeArray1D = cpsToPxs(controlPoints);
debugDrawPoints();
debugDrawCurves();
testDraw2(landscapeArray1D);


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