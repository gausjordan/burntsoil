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
    drawTerrain(false, innerHeight/3);
});

// Get realtime relative mouse coordinates on a canvas
function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top }
}


// Get 'n' pairs of random numbers
function randomSineData(n) {
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


// Generate random data to be used by the jagged terrain generator
function randomJaggedData() {
    let stepSpans = [];
    let stepAngles = [];
    let maxWidth = window.screen.availWidth;

    stepSpans[0] = 0;
    stepAngles[0] = 0;
    
    let doRewrite = true;
    for (let i = 1; i < maxWidth; i++) {
        stepSpans[i] = randomInteger(innerWidth/5, innerWidth/200);
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
    return {
        spans: stepSpans,
        angles: stepAngles
    }
}


// Generate jagged terrain, outline only
function generateJaggedTerrain(jaggedInputData) {
    let span;
    let i = 1;
    let j = 1;
    let curveOutline = [];
    curveOutline[0] = 0;
    
    while ( i < innerWidth ) {
        for (let g = 0; g < jaggedInputData.spans[j]; g++) {
            if (jaggedInputData.angles[j] == 0 && g == 0) {
                g = Math.round(jaggedInputData.spans[j] / 2);
            }
            curveOutline[i] = curveOutline[i-1] + 1*jaggedInputData.angles[j];
            i++;
        }
        j++;
    }        
    return curveOutline.map(v => v * 5);
}


// Generate sinusoidal terrain, outline only
function generateSmoothTerrain(sineInputData) {
    let result;
    let curveOutline = [];

    // For each pixel of width
    for (let i = 0; i < innerWidth; i++) {
        result = 0;

        // iterate through "complexity" no. of sine functions, and sum up
        for (let j = 0; j < sineInputData.length; j++) {

            result += (
                // the lower the frequency, the higher the amplitude
                    (sineInputData.length-j) * 10
                // times random amplitude coeficient
                    * sineInputData[j][0]
                // Sine function
                    * Math.sin(
                // a fraction of the X axis as an argument
                    i / 12 * sineInputData[j][1] * j*j / 1000
                // random phase shift coefficient
                    + sineInputData[j][0] * sineInputData[j][1] * 10)
                );
        }
        curveOutline[i] = result;
    }
    return curveOutline;
}


// Combine two point arrays, representing terrain outline, into one
function combineTerrain(smoothTerrGenerator, jaggedTerrGenerator) {
    let curveOutline = [];
    let smooth = smoothTerrGenerator(sineInputData);
    let jagged = jaggedTerrGenerator(jaggedInputData);

    for (let i=0; i<innerWidth; i++) {
        curveOutline[i] = (1-smoothToJaggedRatio) * smooth[i] * 1
                        + jagged[i] * smoothToJaggedRatio * 1;
    }
    return curveOutline;
}

// Draws terrain. Takes in two generator functions
let sineInputData;
let jaggedInputData;
let smoothToJaggedRatio;
function drawTerrain(randomize, heightLimit) {
    if (heightLimit == undefined) {
        heightLimit = 0;
    }
    if (randomize) {
        sineInputData = randomSineData(20);
        jaggedInputData = randomJaggedData();
        smoothToJaggedRatio = Math.random();
    }
    let raw = combineTerrain(generateSmoothTerrain, generateJaggedTerrain);
    let max = Math.max(...raw);
    let min = Math.min(...raw);

    let curveOutline = [];
    curveOutline = raw.map(v => {
        return (
            //(v - min) + heightLimit / (max-min+heightLimit) * innerHeight
            //v + heightLimit
            (v-min) + heightLimit
        );
    });

    bC.fillStyle = "rgb(120,155,250)";

    for (let i = 0; i < innerWidth; i++) {
        bC.fillRect(i, curveOutline[i], 1, innerHeight);
    }
}

function backdrop() {
    let r = 52;
    let g = 52;
    let b = 148;
    for (let i = 0; i < innerHeight; i = i + (innerHeight/28)) {
        bC.fillStyle = `rgb(${r},${g},${b}`;
        bC.fillRect(innerHeight/28, i, 4, 4);
        r++;
        g++;
        b++;
    }
        
}

backdrop();

drawTerrain(true, innerHeight/3);



// Drawing
fC.font = "16px sans-serif";
bC.font = "16px sans-serif";

function doDraw() {
    //bC.clearRect(0,0,innerWidth,innerHeight);
    //fC.clearRect(0,0,innerWidth,innerHeight);
    
    bC.fillStyle = "rgb(0,255,0)";

    fC.fillStyle = "rgb(0,0,0)";
    bC.fillStyle = "rgb(0,0,0)";

    fC.fillText(bColorValueAtPos, 10, 30);
    bC.fillText(fColorValueAtPos, 410, 30);
}


function opa() {
    requestAnimationFrame(opa);
    doDraw();
}

opa();