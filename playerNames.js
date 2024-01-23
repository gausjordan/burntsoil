/*
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');
*/

// Off topic
let funk = 505;
let varName = "funk";
console.log(window[funk]);


// Resize screen height and re-center vertically on resize (virual keyboard)
let mainElement = document.getElementsByTagName("main")[0];
let canv = document.getElementById("canv");
let mHeight = mainElement.getBoundingClientRect().height;
let mWidth = mainElement.getBoundingClientRect().width;
let ctx = canv.getContext('2d');
let ratio = Math.ceil(window.devicePixelRatio);

canv.width = mWidth;
canv.height = mHeight;

ctx.width = mWidth / ratio + "px";
ctx.height = mHeight / ratio + "px";


window.addEventListener('resize', function() {
    document.body.style.height = window.innerHeight + 'px';
    document.body.style.height = window.visualViewport.height + 'px';
    
    mainElement.style.height = window.visualViewport.height + 'px';
    
    canv.width = mWidth + "px";
    canv.height = mHeight + "px";
    ctx.width = canv.width;
    ctx.height = canv.height;
});


let r = 0;
let g = 175;
let b = 175;

drawHorizontalBars(r, g, b);


function drawHorizontalBars(r, g, b) {

    let gradient = generateColorGradient(r,g,b, 18, 15);

    // TODO
    gradient.forEach((color, index) => {
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fillRect(index*20, 0, 20, 16000);
    });

}

/** Returns an array of colors, each being another array containing 3 "ints"
 * (R,G,B values). Initial values are decremented in each step, until either
 * shade turns darker than 'treshold' parameter.
 * @param {*} r red component [0-255]
 * @param {*} g green component [0-255]
 * @param {*} b blue component [0-255]
 * @param {*} decrement step (how darker each step gets)
 * @returns an array of triples
 */
function generateColorGradient(r, g, b, decrement, threshold) {
    let gradient = [];

    if (!decrement)
        decrement = 20;

    if (!threshold)
        threshold = 20;

    while (r > threshold || g > threshold || b > threshold) {
        r = (r != 0) ? r -= decrement : r = 0;
        g = (g != 0) ? g -= decrement : g = 0;
        b = (b != 0) ? b -= decrement : b = 0;
        gradient.push([r, g, b]);
    }

    return gradient;
}
