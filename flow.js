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



// Globals
let bColorValueAtPosition = "-";
let fColorValueAtPosition = "-";

// Setup event listeners
window.addEventListener("click", (ev) => {
    posX = getMousePos(bgCanvas, ev).x;
    posY = getMousePos(bgCanvas, ev).y;
    bColorValueAtPosition = bC.getImageData(posX, posY, 1, 1).data;
    fColorValueAtPosition = fC.getImageData(posX, posY, 1, 1).data;
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


// Get 'n' pairs of random coefficients
let cffs = [];
function randomCoeffs(n) {
    for (let i = 0; i < n; i++) {
        cffs[i] = [ Math.random(), Math.random() ];
    }
    return cffs;
}


// Compute pseudo-random sinusoidal terrain
function computeTerrain(coeffsNumber) {
    let result;
    // let cffs = randomCoeffs(coeffsNumber);
     for (let i = 0; i < innerWidth; i++) {
        result = 0;
        for (let j = 0; j < coeffsNumber; j++) {
            result +=
            + ((innerHeight-10*Math.random()) * cffs[j][0]*(j/1000+1)
            * Math.sin(j+Math.sin(cffs[j][0]) * j * i * 0.0015
            + j*Math.sin(j)*cffs[j][1]*0.15) / coeffsNumber );
        }
        for (let j = 0; j < coeffsNumber; j++) {
            result +=
            + ((innerHeight-10*Math.random()) * cffs[j][0]/50
            * Math.sin(j+Math.sin(cffs[j][0]*15) * j * i * 0.0035
            + j*Math.sin(j)*cffs[j][1]*0.15) / coeffsNumber );
        }
        bC.fillStyle = "rgb(120,155,250)";
        bC.fillRect(i, result+0.5*innerHeight, 1, innerHeight);
    }
}

const terrainComplexity = 14;
randomCoeffs(terrainComplexity)
computeTerrain(terrainComplexity);

// Drawing
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    
    bC.fillStyle = "rgb(0,255,0)";

    for (let i = 0; i < cvWidth; i++) {
          //bC.fillRect(i, 0.7*cvHeight * functionSet[0](i/cvWidth*3), 5, 5)
          //bC.fillRect(i, 0.3*cvHeight * functionSet[0](i/cvWidth*20) + (0.3)*cvHeight, 5, 5)
        // bC.fillRect(i, 0.3*cvHeight * functionSum(i/cvWidth*20) + (0.3)*cvHeight, 5, 5)
          // bC.fillRect(i, 0.7*cvHeight * f1(i/cvWidth*3) + (0.3)*cvHeight, 5, 5)
          // console.log(cvWidth);

    }


    fC.fillStyle = "rgb(0,0,0)";
    bC.fillStyle = "rgb(0,0,0)";
    //bColorValue = bC.getImageData(posX, posY, 1, 1).data;
    //fColorValue = fC.getImageData(posX, posY, 1, 1).data;
    fC.fillText(bColorValueAtPosition, 10, 30);
    bC.fillText(fColorValueAtPosition, 410, 30);
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();