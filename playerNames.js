// Resize screen height and re-center vertically on resize (virual keyboard)
let mainElement = document.getElementsByTagName("main")[0];
let canv = document.getElementById("canv");
let mHeight = mainElement.getBoundingClientRect().height;
let mWidth = mainElement.getBoundingClientRect().width;
let ctx = canv.getContext('2d');
let ratio = Math.ceil(window.devicePixelRatio);
let inputBar = document.getElementById("fname");

canv.width = mWidth;
canv.height = mHeight;
ctx.width = mWidth / ratio + "px";
ctx.height = mHeight / ratio + "px";

window.addEventListener('resize', function() {
    mHeight = mainElement.getBoundingClientRect().height;
    mWidth = mainElement.getBoundingClientRect().width;
    mainElement.style.height = window.visualViewport.height + 'px';
    let screenHeight = Math.round(window.visualViewport.height);
    let formSize = Math.round(mainElement
                            .getElementsByClassName("frame")[0]
                            .getBoundingClientRect().height);
    
    // In landscape mode, keyboard may take up too much screen estate
    // For the time being, this is done via CSS.
    if (formSize > window.visualViewport.height) {}

    canv.width = mWidth;
    canv.height = mHeight;
    ctx.width = mWidth / ratio + "px";
    ctx.height = mHeight / ratio + "px";

});


drawVerticalBars(255, 0, 0, 10, 20, 12);


/**
 *  Draws animated horizontal bars of selected color
 * @param {*} r color component
 * @param {*} g color component
 * @param {*} b color component
 * @param {*} decrement how darker each bar gets
 * @param {*} threshold how dark is it going to get  */
function drawVerticalBars(r, g, b, decrement, threshold, barWidth) {

    let initGradient1 = generateColorGradient(r, g, b, decrement, threshold);
    let initGradient2 = structuredClone(initGradient1);
    initGradient2.shift();
    initGradient2.pop();
    let gradient = initGradient1.concat(initGradient2.reverse());
    let colorsNum = gradient.length;
    let i = 0;

    drawBarset();

    // Repeat forever
    setInterval( () => {
        gradientShift();
        drawBarset();
    }, 50);
    
    
    // Shift color palette
    function gradientShift() {
        let firstElement = gradient.shift();
        gradient.push(firstElement);
    }
    
    // Draw one frame of vertical bars
    function drawBarset() {
        i = 0;
        while ( (i * barWidth) < (mWidth) ) {
            ctx.fillStyle = `rgb(${gradient.at(i%colorsNum)[0]},
                                 ${gradient.at(i%colorsNum)[1]},
                                 ${gradient.at(i%colorsNum)[2]})`;
            ctx.fillRect(i*barWidth, 0, barWidth, 16000);
            i++;
        }
    }







}



/** Generates a gradient of colors, gradually turning dark
 * @param {*} r color component
 * @param {*} g color component
 * @param {*} b color component
 * @param {*} decrement how rapid each step is
 * @param {*} threshold how dark will it ultimately get
 * @returns array of RGB [0-255] integer triples
 */
function generateColorGradient(r, g, b, decrement, threshold) {
    let result = [[r, g, b]];
    let tempTriple = [];
    while (!canGoOn(result, threshold)) {
        tempTriple = [];
        result.at(-1).forEach( c => {
            if (c < threshold) {
                tempTriple.push(c);
            } else {
                if ( (c - decrement) > threshold) {
                    tempTriple.push(c - decrement);
                } else {
                    tempTriple.push(threshold);
                }
            }
        });
        result.push(tempTriple);
    }
    return result;
}


/** Returns "true" when any of the three color components,
 * unless it was zero to begin with, reaches the "threshold"
 * (lower limit of darkness).
 */
function canGoOn(gradient, threshold) {
    return gradient.at(-1)
        .filter(component => component !== 0)
        .some(component => (component == threshold));
}