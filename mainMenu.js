let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvRef = document.getElementById("canvas");
let ratio = Math.ceil(window.devicePixelRatio);
canvRef.width = getCanvasSize(canvRef, 8, 8)[0] * ratio;
canvRef.height = getCanvasSize(canvRef, 8, 8)[1] * ratio;
canvRef.style.width = canvRef.width / ratio + "px";
canvRef.style.height = canvRef.height / ratio + "px";
let canvCtx = canvRef.getContext('2d');


// Debug info for mobile browsers
document.getElementsByTagName('h1')[0].innerHTML =
      "<br>Width: " + canvRef.width
    + "<br>Height: " + canvRef.height
    + "<br>DPR: " + window.devicePixelRatio;

let rawPoints1 = generateCps(15);
let normPoints1 = normalizeCps(rawPoints1, canvRef.width);
let pixels = cpsToPxs(normPoints1);

//drawBackdrop(canvRef.width, canvRef.height);
//drawTerrain(canvRef.width * 2.75, canvRef.height * 2.75, terrain, oldWidth, oldHeight);

// Drawing
canvCtx.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    canvCtx.fillStyle = "rgb(0,0,0)";
    if (colorValueAtPos != null) {
        canvCtx.fillText(colorValueAtPos, 10, 30);
    }
}

function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();