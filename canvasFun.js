// Initial Styling
let naslov = document.querySelector("h1");
let bgCanvas = document.getElementById("background");
let fgCanvas = document.getElementById("foreground");

bgCanvas.height = window.innerHeight - naslov.getBoundingClientRect().height;
fgCanvas.height = window.innerHeight - naslov.getBoundingClientRect().height;
bgCanvas.width = window.innerWidth;
fgCanvas.width = window.innerWidth;


// Initialization
var bC = bgCanvas.getContext('2d');
var fC = fgCanvas.getContext('2d');
let posX = 0;
let posY = 0;


// Get relative mouse coordinates on canvas(es)
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
}
window.addEventListener("mousemove", (ev) => {
    posX = getMousePos(bgCanvas, ev).x;
    posY = getMousePos(bgCanvas, ev).y;
});


// Bullshit functions
function f1(x) {
    return Math.sin(x);
}
function f2(x) {
    return Math.sin(3.7*x);
}


// Drawing

let bColorValue = "-";
let fColorValue = "-";
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    bC.fillStyle = "rgb(0,255,0)";
    for (let i=20; i<window.innerWidth-20; i++) {
        bC.fillRect(i, (2+f1(i/100))*200, 40, 40);
    }

    fC.fillStyle = "rgb(255,0,0)";
    for (let i=20; i<window.innerWidth-20; i++) {
        fC.fillRect(i, (2+f2(i/100))*200, 40, 40);
    }

    fC.fillStyle = "rgb(0,0,0)";
    bC.fillStyle = "rgb(0,0,0)";
    fC.fillText(bColorValue, 10, 30);
    bC.fillText(fColorValue, 410, 30);

}


function opa() {
    requestAnimationFrame(opa);
    bC.clearRect(0,0,innerWidth,innerHeight);
    fC.clearRect(0,0,innerWidth,innerHeight);
    doDraw();
    bColorValue = bC.getImageData(posX, posY, 1, 1).data;
    fColorValue = fC.getImageData(posX, posY, 1, 1).data;
}

opa();