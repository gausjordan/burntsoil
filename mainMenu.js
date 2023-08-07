let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvRef = document.getElementById("canvas");
let canvasCtx = canvRef.getContext('2d');
canvRef.width = getCanvasSize(canvRef, 8, 8)[0];
canvRef.height = getCanvasSize(canvRef, 8, 8)[1];


// TODO: Portrait mode: Navbar does not stretch to fit


// Debug info for mobile browsers
document.getElementsByTagName('h1')[0].innerHTML =
      "<br>Width: " + canvRef.width
    + "<br>Height: " + canvRef.height
    + "<br>DPR: " + window.devicePixelRatio;

let loResCps = buildCps(canvRef.width, canvRef.height, false, false);
let hiResCps = buildCps(canvRef.width, canvRef.height, false, true);
let terrain = combineCps(loResCps, hiResCps, canvRef.width);
let oldHeight = canvRef.height;
let oldWidth = canvRef.width;

drawBackdrop(canvRef.width, canvRef.height);
drawTerrain(canvRef.width, canvRef.height, terrain, oldWidth, oldHeight);


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