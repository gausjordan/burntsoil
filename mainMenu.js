let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.width = getCanvasSize(canvasRef, 8, 8)[0];
canvasRef.height = getCanvasSize(canvasRef, 8, 8)[1];



// TODO: Portrait mode: Navbar does not stretch to fit
//       Decouple buildTerrain (re-use single set of control points)

// Debug info for mobile browsers
document.getElementsByTagName('h1')[0].innerHTML =
      "<br>Width: " + canvasRef.width
    + "<br>Height: " + canvasRef.height
    + "<br>DPR: " + window.devicePixelRatio;

let loResCps = buildCps(canvasRef.width, canvasRef.height, false, false);
let hiResCps = buildCps(canvasRef.width, canvasRef.height, false, true);
let terrain = combineCps(loResCps, hiResCps, canvasRef.width);

drawBackdrop(canvasRef.width, canvasRef.height);
drawTerrain(canvasRef.width, terrain);


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