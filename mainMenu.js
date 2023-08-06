let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
let rect = canvasRef.parentElement.getBoundingClientRect();
canvasRef.width = rect.width -8;
canvasRef.height = rect.height -8;


// TODO: Portrait mode: Navbar does not stretch to fit
//       Decouple buildTerrain (re-use single set of control points)

// Debug info for mobile browsers
document.getElementsByTagName('h1')[0].innerHTML =
      "<br>Width: " + canvasRef.width
    + "<br>Height: " + canvasRef.height
    + "<br>DPR: " + window.devicePixelRatio;


backdrop(canvasRef.width, canvasRef.height);
let terrain = buildTerrain(canvasRef.width, canvasRef.height, true);
console.log(terrain);
draw(terrain);



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

