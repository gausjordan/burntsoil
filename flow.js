//  Get HTML element references, setup both canvases
let flexMain = document.querySelector("main");
let bgCanvas = document.getElementById("background");
let fgCanvas = document.getElementById("foreground");
let cvHeight = flexMain.clientHeight;
let cvWidth = flexMain.clientWidth;
let bC = bgCanvas.getContext('2d');
let fC = fgCanvas.getContext('2d');
bgCanvas.height = fgCanvas.height = cvHeight;
bgCanvas.width = fgCanvas.width = cvWidth;


// Globals
let bColorValueAtPos = "-";
let fColorValueAtPos = "-";


// Get pixel color values at mouse position, on click event
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    posX = getMousePos(bgCanvas, ev).x;
    posY = getMousePos(bgCanvas, ev).y;
    bColorValueAtPos = bC.getImageData(posX, posY, 1, 1).data;
    fColorValueAtPos = fC.getImageData(posX, posY, 1, 1).data;
});


window.addEventListener("resize", (ev) => {
    cvHeight = flexMain.clientHeight;
    cvWidth = flexMain.clientWidth;
    bgCanvas.height = fgCanvas.height = cvHeight;
    bgCanvas.width = fgCanvas.width = cvWidth;
    drawTerrain();
});

// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


// Get 'n' pairs of random numbers
function randomCoeffs(n) {
    let cffs = [];
    for (let i = 0; i < n; i++) {
        cffs[i] = [ Math.random(), Math.random() ];
    }
    return cffs;
}


// Get a random integer in a given range
function randomInteger(lower, upper) {
    lower = Math.ceil(lower);
    upper  = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}


// Generate random data used by the jagged terrain generator
function randomJaggedData(existingSpans, existingAngles) {
    let stepSpans = [];
    let stepAngles = [];
    let maxWidth = window.screen.availWidth;
    if (existingSpans != undefined && existingAngles != undefined) {
        stepSpans = existingSpans;
        stepAngles = existingAngles;
    } else {
        stepSpans[0] = 0;
        stepAngles[0] = 0;
        
        let doRewrite = true;
        for (let i = 1; i < maxWidth; i++) {
            stepSpans[i] = randomInteger(innerWidth/10, innerWidth/20);
            if (doRewrite) {
                newAngle = Math.random() - 0.5;
            }
            doRewrite = true;
            if (( stepAngles[i-1] < 0 && newAngle > 0 )
                || (stepAngles[i-1] > 0 && newAngle < 0 )) {
                    stepAngles[i] = 0;
                    doRewrite = false;
            } else {
                stepAngles[i] = newAngle;
            }
        }
    }
    console.log(stepAngles);
}

randomJaggedData();
//randomJaggedData([11,22,33],[44,55,66]);


// Generate jagged terrain, outline only
function generateJaggedTerrain() {
    let curveOutline = [];
    let sum = 0;
    let step = 0;
    let randomAngle = 1;
    let randomStep = randomInteger(0, innerWidth/12);
    curveOutline[0] = 0;


    while (sum < innerWidth) {
        step = randomStep;
        do {
            randomAngle = Math.random()-0.5;
        } while (randomAngle == 0.00);
        
        for (let i = 0; i < step; i++) {
            curveOutline[sum+1] = curveOutline[sum] + randomAngle*5;
            sum++;
        }
    }
    return curveOutline;
}


// Generate sinusoidal terrain, outline only
function generateSmoothTerrain() {
    let complexity = 20;
    let result;
    let cffs = randomCoeffs(complexity);
    let curveOutline = [];

    // For each pixel of width
    for (let i = 0; i < innerWidth; i++) {
        result = 0;

        // iterate through "complexity" no. of sine functions, and sum up
        for (let j = 0; j < cffs.length; j++) {

            result += (
                // the lower the frequency, the higher the amplitude
                    (cffs.length-j) * 10
                // times random amplitude coeficient
                    * cffs[j][0]
                // Sine function
                    * Math.sin(
                // a fraction of the X axis as an argument, width-dependent
                    i / (innerWidth/100)
                // random frequency multiplier
                    * cffs[j][1] * j*j / 1000
                // random phase shift coefficient
                    + cffs[j][0] * cffs[j][1] * 10)
                );
        }
        curveOutline[i] = result;
    }
    return curveOutline;
}


// Combine two point arrays, representing terrain outline, into one
function combineTerrain(smoothTerrGenerator, jaggedTerrGenerator) {
    let curveOutline = [];
    let smooth = smoothTerrGenerator();
    let jagged = jaggedTerrGenerator();
    let smoothToJaggedRatio = Math.random();

    for (let i=0; i<innerWidth; i++) {
        curveOutline[i] = 0 * (1/smoothToJaggedRatio) * smooth[i]  // DEBUG
                        + jagged[i] * smoothToJaggedRatio;
    }
    return curveOutline;
}


// Draws terrain. Takes in two generator functions
function drawTerrain(reRandomize, heightLimit) {
    let raw = combineTerrain(generateSmoothTerrain, generateJaggedTerrain);
    let max = Math.max(...raw);
    let min = Math.min(...raw);
    console.log("Max: " + max);
    console.log("Min: " + min);

    let curveOutline = [];
    curveOutline = raw.map(v => {
        return (
            (v - min) / (max-min) * innerHeight
        );
    });

    bC.fillStyle = "rgb(120,155,250)";

    for (let i = 0; i < innerWidth; i++) {
        bC.fillRect(i, curveOutline[i], 1, innerHeight);
    }
}

drawTerrain(true);



// Drawing
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    
    bC.fillStyle = "rgb(0,255,0)";

    fC.fillStyle = "rgb(0,0,0)";
    bC.fillStyle = "rgb(0,0,0)";
    //bColorValue = bC.getImageData(posX, posY, 1, 1).data;
    //fColorValue = fC.getImageData(posX, posY, 1, 1).data;
    fC.fillText(bColorValueAtPos, 10, 30);
    bC.fillText(fColorValueAtPos, 410, 30);
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();