let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvRef = document.getElementById("canvas");
let ratio = Math.ceil(window.devicePixelRatio);
canvRef.width = getCanvasSize(canvRef, 8, 8)[0] * ratio;
canvRef.height = getCanvasSize(canvRef, 8, 8)[1] * ratio;
canvRef.style.width = canvRef.width / ratio + "px";
canvRef.style.height = canvRef.height / ratio + "px";
let canvasCtx = canvRef.getContext('2d');


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
drawTerrain(canvRef.width * 2.75, canvRef.height * 2.75, terrain, oldWidth, oldHeight);


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