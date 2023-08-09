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

let rawPoints1 = generateCps(5);
let rawPoints2 = generateCps(10);
let normPoints1 = normalizeCps(rawPoints1, canvRef.width);
let normPoints2 = normalizeCps(rawPoints2, canvRef.width);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);
let pixels3 = [];

canvCtx.fillStyle = "rgba(0,255,0,1)";
pixels1.forEach( (c, index) =>
    canvCtx.fillRect(index, canvRef.height-c, 1, 10));
pixels2.forEach( (c, index) =>
    canvCtx.fillRect(index, canvRef.height-c, 1, 10));
pixels3 = pixels1.map( (e, index) => { return e + 0.2*pixels2[index]; });

canvCtx.fillStyle = "rgba(255,0,0,1)";
pixels3.forEach( (c, index) => canvCtx.fillRect(index, canvRef.height-c, 1, 10));

//drawBackdrop(canvRef.width, canvRef.height);


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