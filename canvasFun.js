// Canvas(es) size setup and initialization
let header = document.querySelector("h1");
let bgCanvas = document.getElementById("background");
let fgCanvas = document.getElementById("foreground");

let cvHeight = window.innerHeight - header.getBoundingClientRect().height;
let cvWidth = window.innerWidth;

bgCanvas.height = fgCanvas.height = cvHeight;
bgCanvas.width = fgCanvas.width= cvWidth;

let bC = bgCanvas.getContext('2d');
let fC = fgCanvas.getContext('2d');


// Get (relative) mouse coordinates on a canvas
let posX = 0;
let posY = 0;
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
}
window.addEventListener("mousemove", (ev) => {
    posX = getMousePos(bgCanvas, ev).x;
    posY = getMousePos(bgCanvas, ev).y;
});


// Terrain generator functions
function f1(x) { return Math.sin(x); }
function f2(x) { return Math.sin(2*x); }


// Drawing
let bColorValue = "-";
let fColorValue = "-";
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    bC.clearRect(0,0,innerWidth,innerHeight);
    fC.clearRect(0,0,innerWidth,innerHeight);
    bC.fillStyle = "rgb(0,255,0)";
    let f1Arr = [];
    let f2Arr = [];
    for (let i = 0; i < cvWidth; i++) {
        f2Arr[i] = 
        bC.fillRect(i, 0.7*cvHeight * f1(i/cvWidth*3) + (0.3)*cvHeight, 5, 5)
        //console.log(cvWidth);
    }
    
    fC.fillStyle = "rgb(255,0,0)";
    for (let i=20; i<window.innerWidth-20; i++) {
        fC.fillRect(i, (2+f2(i/100))*200, 5, 5);
    }

    fC.fillStyle = "rgb(0,0,0)";
    bC.fillStyle = "rgb(0,0,0)";
    bColorValue = bC.getImageData(posX, posY, 1, 1).data;
    fColorValue = fC.getImageData(posX, posY, 1, 1).data;
    fC.fillText(bColorValue, 10, 30);
    bC.fillText(fColorValue, 410, 30);
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();

}

opa();