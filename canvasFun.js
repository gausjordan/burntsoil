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


// Setup event listeners
window.addEventListener("mousemove", (ev) => {
    posX = getMousePos(bgCanvas, ev).x;
    posY = getMousePos(bgCanvas, ev).y;
});


// Current mouse position variable (on canvas)
let posX = 0;
let posY = 0;


// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


// Get 'n' random coefficients to buid terrain with
function randomCoeffs(n) {
    let cffs = [];
    for (let i = 0; i < n; i++) {
        cffs[i] = [ Math.random(), Math.random() ];
    }
    return cffs;
}

// Generate terrain curve function
function generateTerrainCurve(len) {
    let functionSet = [];
    let cffs = randomCoeffs(len);
    let functions = [];
    for (let c in cffs) {
        functionSet[c] = function(x) {
            return Math.sin(cffs[c][0]*Number(x) + cffs[c][1]*1000);
        }

    }
    return functionSet;
}

let functionSet = generateTerrainCurve(5);

// Drawing
let bColorValue = "-";
let fColorValue = "-";
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    bC.clearRect(0,0,innerWidth,innerHeight);
    fC.clearRect(0,0,innerWidth,innerHeight);
    bC.fillStyle = "rgb(0,255,0)";

    for (let i = 0; i < cvWidth; i++) {
        //bC.fillRect(i, 0.7*cvHeight * functionSet[0](i/cvWidth*3), 5, 5)
        bC.fillRect(i, 0.2*cvHeight * functionSet[0](i/cvWidth*20) + (0.3)*cvHeight, 5, 5)
        //bC.fillRect(i, 0.7*cvHeight * f1(i/cvWidth*3) + (0.3)*cvHeight, 5, 5)
        //console.log(cvWidth);

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