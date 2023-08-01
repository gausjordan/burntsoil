let colorValueAtPos = null;
let flexMain = document.querySelector("main");
let canvasRef = document.getElementById("canvas");
let canvasCtx = canvasRef.getContext('2d');
canvasRef.height = flexMain.clientHeight * window.devicePixelRatio;
canvasRef.width = flexMain.clientWidth * window.devicePixelRatio;

// DEBUG for mobile
document.getElementsByTagName('h1')[0].innerHTML =
    "Width: " + canvasRef.width + ", Height: " + canvasRef.height;

buildTerrain(canvasRef.width, canvasRef.height, false);

/*
    canvasCtx.fillStyle = "rgba(0,0,255,255)";
    testDraw2(loResArr);
    canvasCtx.fillStyle = "rgba(255,0,0,255)";
    testDraw2(hiResArr);
*/




/**
 * Builds random terrain out of an array of control point objects (x and y
 * coordinates) by adding up two curves, containing low and high frequency
 * content respectively.
 * @param {*} width - canvas width (in pixels)
 * @param {*} height - canvas height (in pixels)
 * @param {*} isLow - if 'true', terrain gets lowered to show more background
 * @returns and array of pixel heights, one for each horizontal pixel
 */
function buildTerrain(width, height, isLow) {
    let magicNums = isLow ? [4, 2, 0.1, 0.3, 10, 8, 0.75, 0.6]
                          : [4, 2, 0.1, 0.3, 10, 8, 0.75, 0.6];
    alert(magicNums);
    let loResCps = generateCps(width / 4,
            width / 2,
            height * 0.1,
            height - height * 0.30);
    let hiResCps = generateCps(width / 10,
            width / 8,
            height * 0.75,
            height - height * 0.6);
    let loResArr = cpsToPxs(loResCps, width);
    let hiResArr = cpsToPxs(hiResCps, width);

    let landscapeArrayMix = loResArr.map( (n, i) => n + 0.4 * hiResArr[i] );

    canvasCtx.fillStyle = "rgba(0,255,0,255)";
    testDraw2(landscapeArrayMix);

    return landscapeArrayMix;
}






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