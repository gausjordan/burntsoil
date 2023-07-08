//  Get HTML element references, setup both canvases
let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight;
canvasRef.width = flexMain.clientWidth;
let canvasWidth = canvasRef.width;
let canvasHeigth = canvasRef.height;


// Get pixel color values at mouse position, on click event
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvasRef, ev).x;
    posY = getMousePos(canvasRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


// On resize - reset
window.addEventListener("resize", (ev) => {
    canvasRef.height = flexMain.clientHeight;
    canvasRef.width = flexMain.clientWidth;
    let pixelData = generateContour(cPoints);
    drawPixelData(pixelData);
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


// Create random (landscape) curve control points
function generateControlPoints() {
    let pointPositions = [];
    let pointHeights = [];

    for (let i=0; i < 12; i++) {
        // points[i] = randomInteger(80, 600);
    }
    // hardcoded debug points
    pointPositions = [10, 5, 10, 15, 18, 2, 10, 15, 5, 10];
    pointHeights = [50, 200, 100, 350, 50, 300, 600, 500, 400, 90];

    let points = pointPositions.map((currentValue, index) => {
        return {
            y: pointPositions[index],
            x: pointHeights[index]
        }
    });

    return points;
}



// Takes control points in, returns an array of heights (landscape contour)
function generateContour(cPts) {

    // weights = [10, 5, 10, 15, 18, 2, 10, 15, 5, 10];

    let contour = new Array(canvasRef.width).fill(0);
    
    return contour;    
}


controlPoints = generateControlPoints();

let proba = catmullRomSolver(controlPoints, 0.5, 0.5, 0.5);


function catmullRomSolver(cPts, alpha, tension, position) {
    
    for (let point = 0; point < cPts.length-3; point++) {

        let dist01 = Math.sqrt(
                     Math.pow( (cPts[point+1].x - cPts[point].x), 2) +
                     Math.pow( (cPts[point+1].y - cPts[point].y), 2) );
        let dist12 = Math.sqrt(
                     Math.pow( (cPts[point+2].x - cPts[point+1].x), 2) +
                     Math.pow( (cPts[point+2].y - cPts[point+1].y), 2) );
        let dist23 = Math.sqrt(
                     Math.pow( (cPts[point+3].x - cPts[point+2].x), 2) +
                     Math.pow( (cPts[point+3].y - cPts[point+2].y), 2) );

        let t01 = Math.pow(dist01, alpha);
        let t12 = Math.pow(dist12, alpha);
        let t23 = Math.pow(dist23, alpha);

        let m1 = {
            x:  (1 - tension) *
                ( 2 - cPts[point+2].x - cPts[point+1].x + t12 *
                    ( (cPts[point+1].x - cPts[point].x) / t01 -
                    (cPts[point+2].x - cPts[point].x) / (t01 + t12)
                    )
                ),
            y:  (1 - tension) *
                ( 2 - cPts[point+2].y - cPts[point+1].y + t12 *
                    ( (cPts[point+1].y - cPts[point].y) / t01 -
                    (cPts[point+2].y - cPts[point].y) / (t01 + t12)
                    )
                )
        };

        let m2 = {
            x:  (1 - tension) *
                ( 2 - cPts[point+2].x - cPts[point+1].x + t12 *
                    ( (cPts[point+3].x - cPts[point+2].x) / t23 -
                    (cPts[point+3].x - cPts[point+1].x) / (t12 + t23)
                    )
                ),
            y:  (1 - tension) *
                ( 2 - cPts[point+2].y - cPts[point+1].y + t12 *
                    ( (cPts[point+3].y - cPts[point+2].y) / t23 -
                    (cPts[point+3].y - cPts[point+1].y) / (t12 + t23)
                    )
                )
        };

        let a = {
            x: 2 * (cPts[point+1].x - cPts[point+2].x) + m1.x + m2.x,
            y: 2 * (cPts[point+1].y - cPts[point+2].y) + m1.y + m2.y
        };

        let b = {
            x: -3 * (cPts[point+1].x - cPts[point+2].x) - m1.x -m1.x -m2.x,
            y: -3 * (cPts[point+1].y - cPts[point+2].y) - m1.y -m1.y -m2.y,
        };
        
        let c = { x: m1.x, y: m1.y };

        let d = { x: cPts[point+1].x, y: cPts[point+1].y };

        return {
            x:  a.x * Math.pow(position, 3) +
                b.x * Math.pow(position, 2) +
                c.x * position +
                d.x,
            y:  a.y * Math.pow(position, 3) +
                b.y * Math.pow(position, 2) +
                c.y * position +
                d.y,
        };
    }
}

canvasCtx.fillStyle = "rgba(255,0,0,255)";
for (let i=0; i < 1; i+= 0.01) {
    let temp = catmullRomSolver(controlPoints, 0.5, -2, i);
    canvasCtx.fillRect(temp.x*3, temp.y*3, 3, 3);
}
  


testDraw();

function testDraw() {

}



function drawPixelData(pixelData) {
    canvasCtx.fillStyle = "rgba(0,0,255,1)";
    for (let i = 0; i < pixelData.length; i++) {
        // canvasCtx.fillRect(i, pixelData[i], 2, 2000);
    }
}


// Returns a 4-point-curve segment value at position "t"
function catmullRom(p0, p1, p2, p3, t) {
    return (
        2 * p1 +
        t * (-p0 + p2) +
        t*t * (2*p0 - 5*p1 + 4*p2 - p3) +
        t*t*t * (-p0 + 3*p1 - 3*p2 + p3)
    ) * 0.5;
}


let cPoints = generateControlPoints();
let pixelData = generateContour(cPoints);
drawPixelData(pixelData);


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