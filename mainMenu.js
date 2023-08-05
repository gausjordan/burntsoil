let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
let rect = canvasRef.parentElement.getBoundingClientRect();
canvasRef.width = rect.width;
canvasRef.height = rect.height;

// DEBUG for mobile
document.getElementsByTagName('h1')[0].innerHTML =
    "Width: " + canvasRef.width + ", Height: " + canvasRef.height
    + "... a DPR je: " + window.devicePixelRatio;

backdrop(canvasRef.width, canvasRef.height);

let terrain = buildTerrain(canvasRef.width, canvasRef.height, true);

testDraw2(terrain);



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

