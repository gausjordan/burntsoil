//  Get HTML element references, setup both canvases
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;


// Get pixel color values at mouse position, on click event
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


// On resize - reset
window.addEventListener("resize", (ev) => {
    canvasHeight = flexMain.clientHeight;
    canvasWidth = flexMain.clientWidth;
    canvasRef.height = canvasCtx.height = canvasHeight;
    canvasRef.width = canvasCtx.width = canvasWidth;
    drawTerrain();
});


// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}



// Get a random integer in a given range
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

// Initial terrain is defined by an outline
let landOutline = [];
landOutline[0] =  randomInteger(0, canvasRef.height);


// Returns a single slope coefficient, current-height dependant
function generateSlopeCoeffs(relHeight) {

    // signedPercentage can take on values in range [-1, 1]
    let signedPercentage = (relHeight / canvasRef.height - 0.5) * 2;
    
    // The higher we are, the less likely it is we'll keep climbing
    if (signedPercentage > 0.8 || signedPercentage < -0.8) {
        return - ( 2 * (Math.random()-0.5) + signedPercentage );
    }
    else {
        return 20 * (Math.random()-0.5);
    }

}

function createLandscapeOutline() {
    let step = Math.round(canvasRef.width / 5);
    let bigCoeff = null;
    for (let i=1; i<canvasRef.width; i+=step) {
        bigCoeff = Math.round( generateSlopeCoeffs(landOutline[i-1]) );
        console.log(bigCoeff);
        for (let j=i; j<i*step+step; j++) {
            landOutline[j] = Math.round( landOutline[j-1] + bigCoeff );
        }
    }
    let a = 3;
    let b = 5;
    

    /*
    for (let i=1; i<canvasRef.width; i++) {
        landOutline[i] = Math.round( landOutline[i-1] + generateSlopeCoeffs(landOutline[i-1]) );
    }
    */


}

function drawTerrain() {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    let horiz = 0;
    landOutline.forEach(i => {
        canvasCtx.fillRect(horiz, canvasRef.height-i, 1, canvasRef.height - (canvasRef.height-i) );
        horiz += 1;
    });

    console.log(landOutline);


    
    // for (let i=0, j=0; i<1800; i++) {
    //     j = Math.sin(i/55)*600;
    //     canvasCtx.fillRect(i, j+800, 2, 2);
    // }
}

createLandscapeOutline();
drawTerrain();

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