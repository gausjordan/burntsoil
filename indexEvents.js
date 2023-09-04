/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;

/*
window.addEventListener("click", (ev) => {
    canvCtx2.fillStyle = "rgb(255,255,255)";
    canvCtx2.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvRef2, ev).x * ratio;
    posY = getMousePos(canvRef2, ev).y * ratio;
    colorValueAtPos = canvCtx2.getImageData(posX, posY, 1, 1).data;
});
*/


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasSizeFormatterIndex(10, 10);
    let squeezeFactor = canvRef2.width / pixels2.length;
    drawBackdrop(canvRef1.width, canvRef1.height, "sunset");
    drawTerrain(pxMix, squeezeFactor);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});


/** Keyboard shortcuts */
document.addEventListener('keydown', (event) => {
    if (event.key == "s") {

    }
  }, false);